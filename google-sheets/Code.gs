/**
 * Sagar & Ishwari — private RSVP and message collection.
 * Paste this entire file into Extensions > Apps Script in your Google Sheet.
 * Run setup() once, then deploy as a web app: Execute as Me; access Anyone.
 * No spreadsheet rows, editing keys, or guest details are returned by GET.
 */
var HEADERS_ = {
  RSVPs: ['Submission ID', 'Editing key hash', 'Name', 'Email', 'Attending', 'Guests', 'Dietary requirements', 'Submitted (IST)', 'Updated (IST)'],
  Messages: ['Submission ID', 'Editing key hash', 'Name', 'Message', 'Submitted (IST)', 'Content fingerprint']
};

function setup() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Open your Google Sheet, choose Extensions > Apps Script, and run setup from that project.');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    Object.keys(HEADERS_).forEach(function(name) {
      var sheet = book.getSheetByName(name) || book.insertSheet(name);
      var headers = HEADERS_[name];
      if (sheet.getLastRow() > 0) {
        var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
        if (current.join('\n') !== headers.join('\n')) throw new Error('The ' + name + ' tab already contains other data. Rename that tab and run setup again; existing data will not be overwritten.');
      } else sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#6E1F2E').setFontColor('#F8F0E3').setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.hideColumns(1, 2);
      if (name === 'Messages') { sheet.hideColumns(6); sheet.setColumnWidth(4, 420); }
      sheet.setColumnWidth(3, 200);
      if (name === 'RSVPs') { sheet.setColumnWidth(4, 250); sheet.setColumnWidth(7, 300); }
    });
    book.setSpreadsheetTimeZone('Asia/Kolkata');
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', book.getId());
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
}

function doGet() {
  try {
    var book = openBook_();
    if (!book.getSheetByName('RSVPs') || !book.getSheetByName('Messages')) throw new Error('Missing tabs');
    return json_({ ok: true, service: 'Wedding invitations', ready: true });
  } catch (error) {
    return json_({ ok: false, error: 'Run setup in the spreadsheet-bound Apps Script project before deploying.' });
  }
}

function doPost(event) {
  var lock;
  try {
    var contents = event && event.postData && event.postData.contents;
    if (typeof contents !== 'string' || contents.length > 12000) fail_('Please send a valid form.');
    var body;
    try { body = JSON.parse(contents); } catch (error) { fail_('Please send a valid form.'); }
    var data = validate_(body);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) fail_('The guest book is busy. Please try again in a moment.');
    var book = openBook_();
    var name = data.action === 'rsvp' ? 'RSVPs' : 'Messages';
    var sheet = book.getSheetByName(name);
    if (!sheet) throw new Error('Missing sheet');
    var row = findRow_(sheet, data.id);
    var tokenHash = digest_(data.token);
    var now = new Date();
    if (row) {
      var existingHash = String(sheet.getRange(row, 2).getValue());
      if (!equal_(existingHash, tokenHash)) fail_('This response cannot be changed from this browser. Please contact the families.');
      if (data.action === 'message') {
        if (!equal_(String(sheet.getRange(row, 6).getValue()), digest_(data.name + '\n' + data.message))) fail_('This message was already sent. Please refresh to send a new one.');
        return json_({ ok: true, id: data.id, submittedAt: new Date(sheet.getRange(row, 5).getValue()).toISOString() });
      }
    } else {
      row = sheet.getLastRow() + 1;
      if (row > 10001) fail_('Submissions are temporarily unavailable. Please contact the families.');
      if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    }
    if (data.action === 'rsvp') {
      var firstSubmitted = sheet.getRange(row, 8).getValue() || now;
      sheet.getRange(row, 1, 1, 9).setValues([[
        data.id, tokenHash, safeText_(data.name), safeText_(data.email), data.attendance,
        data.guests, safeText_(data.dietary), firstSubmitted, now
      ]]);
      sheet.getRange(row, 8, 1, 2).setNumberFormat('dd mmm yyyy, hh:mm AM/PM');
      sheet.getRange(row, 7).setWrap(true);
    } else {
      sheet.getRange(row, 1, 1, 6).setValues([[
        data.id, tokenHash, safeText_(data.name), safeText_(data.message), now, digest_(data.name + '\n' + data.message)
      ]]);
      sheet.getRange(row, 5).setNumberFormat('dd mmm yyyy, hh:mm AM/PM');
      sheet.getRange(row, 4).setWrap(true);
    }
    // Confirm receipt only after Google Sheets has accepted the write.
    SpreadsheetApp.flush();
    return json_({ ok: true, id: data.id, submittedAt: now.toISOString() });
  } catch (error) {
    return json_({ ok: false, error: error && error.isFormError ? error.message : 'We could not save your response. Please try again or contact the families.' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function openBook_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Setup required');
  return SpreadsheetApp.openById(id);
}
function findRow_(sheet, id) {
  if (sheet.getLastRow() < 2) return 0;
  var found = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext();
  return found ? found.getRow() : 0;
}
function validate_(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail_('Please send a valid form.');
  if (body.website) fail_('Unable to accept this submission.');
  if (body.action !== 'rsvp' && body.action !== 'message') fail_('Unknown form.');
  var id = text_(body.id, 'Submission ID', 36, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) fail_('Invalid submission ID.');
  var token = text_(body.token, 'Editing key', 64, 64);
  if (!/^[a-f0-9]{64}$/i.test(token)) fail_('Invalid editing key.');
  var data = { action: body.action, id: id, token: token, name: text_(body.name, 'Your name', 2, body.action === 'rsvp' ? 100 : 80) };
  if (body.action === 'message') { data.message = text_(body.message, 'Your wish', 5, 600); return data; }
  data.email = text_(body.email == null ? '' : body.email, 'Email address', 0, 200).toLowerCase();
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail_('Please enter a valid email address.');
  if (body.attendance !== 'yes' && body.attendance !== 'no') fail_('Please choose whether you can attend.');
  if (!Number.isInteger(body.guests) || (body.attendance === 'yes' ? body.guests < 1 || body.guests > 6 : body.guests !== 0)) fail_('Please choose a valid number of guests.');
  data.attendance = body.attendance; data.guests = body.guests;
  data.dietary = text_(body.dietary || '', 'Dietary requirements', 0, 300);
  return data;
}
function text_(value, label, min, max) {
  if (typeof value !== 'string') fail_(label + ' is required.');
  var result = value.trim();
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) fail_(label + ' must contain ' + min + '–' + max + ' characters.');
  return result;
}
function fail_(message) { var error = new Error(message); error.isFormError = true; throw error; }
function safeText_(value) { return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value; }
function digest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8).map(function(byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
}
function equal_(left, right) {
  if (left.length !== right.length) return false;
  var difference = 0;
  for (var i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
