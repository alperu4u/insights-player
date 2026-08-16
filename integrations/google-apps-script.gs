/**
 * Castro Player Development — Google Sheets + email receiver
 * 1. Create a Google Sheet and open Extensions > Apps Script.
 * 2. Paste this file, deploy as a Web App, and set access to "Anyone".
 * 3. In Project Settings > Script properties add INTEGRATION_TOKEN with a long random value.
 * 4. Add the deployment URL and the same token to the Site environment as
 *    GOOGLE_APPS_SCRIPT_URL and GOOGLE_APPS_SCRIPT_TOKEN.
 */
var COACH_EMAIL = 'allpurpose88@icloud.com';

function doPost(e) {
  try {
  var data = JSON.parse(e.postData.contents || '{}');
  var expectedToken = PropertiesService.getScriptProperties().getProperty('INTEGRATION_TOKEN');
  if (!expectedToken || data.integrationToken !== expectedToken) return json_({ok:false,error:'Unauthorized'});
  if (!data.player || !data.player.name || !data.player.email || !data.player.consent) return json_({ok:false,error:'Missing required fields'});
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName('Assessments') || book.insertSheet('Assessments');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Assessment ID','Date','Player','Parent / Player Email','Age','Position','Gender','Consent','Responses JSON','Scores JSON','Primary Archetype','Nearby Archetypes','Coach Notes','Generated Profile','Reassessment Of','Delivery Status']);
    sheet.setFrozenRows(1);
  }
  var id = Utilities.getUuid();
  var narrative = buildEvidenceSummary_(data);
  var nearby = (data.archetypeMatches || []).slice(1,4).map(function(x){return x.name + ' (' + x.match + '%)'}).join(', ');
  sheet.appendRow([id,new Date(data.completedAt),data.player.name,data.player.email,data.player.age,data.player.position,data.player.gender,data.player.consent ? 'Yes' : 'No',JSON.stringify(data.answers),JSON.stringify(data.scores),data.archetype || 'Not assigned',nearby,data.player.notes || '',narrative,'','Processing']);
  var subject = data.player.name + ' — Castro Player Development Profile';
  var html = '<div style="font-family:Arial;color:#16263a;max-width:620px"><div style="background:#0a2342;color:white;padding:28px"><b>CASTRO PLAYER DEVELOPMENT</b><h1 style="margin-bottom:0">Your player profile is ready</h1></div><div style="padding:28px;border:1px solid #d8e0ea"><p>Thank you for completing the assessment.</p><p>This report is designed to support long-term development and better conversations between player, parent and coach. It does not diagnose, label, or define the player.</p><p><b>Player:</b> '+escapeHtml_(data.player.name)+'</p><p>Your evidence-based profile is attached as a PDF. You can also return to the assessment page for the interactive report.</p><p style="color:#66768a">Better insight. Better coaching. Better growth.</p></div></div>';
  var pdf = data.pdfBase64
    ? Utilities.newBlob(Utilities.base64Decode(data.pdfBase64), 'application/pdf', data.player.name.replace(/[^a-z0-9]/gi,'-')+'-Player-Profile.pdf')
    : createProfilePdf_(data, narrative);
  MailApp.sendEmail({to:String(data.player.email).trim(),subject:subject,htmlBody:html,attachments:[pdf],name:'Castro Player Development'});
  var coachHtml = '<div style="font-family:Arial;color:#16263a;max-width:620px"><h2>New player assessment completed</h2><p><b>Player:</b> '+escapeHtml_(data.player.name)+'</p><p><b>Primary archetype:</b> '+escapeHtml_(data.archetype || 'Developing Profile')+'</p><p><b>Completed:</b> '+escapeHtml_(new Date(data.completedAt).toLocaleString())+'</p><p><b>Submission ID:</b> '+escapeHtml_(id)+'</p><p>The complete report is attached and the responses are saved in your private assessment Sheet.</p></div>';
  MailApp.sendEmail({to:COACH_EMAIL,subject:'New assessment — '+data.player.name,htmlBody:coachHtml,attachments:[pdf.copyBlob()],name:'Castro Player Development'});
  sheet.getRange(sheet.getLastRow(), 16).setValue('Family emailed; coach notified');
  return json_({ok:true,emailSent:true,coachNotified:true,id:id});
  } catch (error) {
    try {
      var failedBook = SpreadsheetApp.getActiveSpreadsheet();
      var failedSheet = failedBook && failedBook.getSheetByName('Assessments');
      if (failedSheet && failedSheet.getLastRow() > 1) failedSheet.getRange(failedSheet.getLastRow(), 16).setValue('Email error: ' + String(error));
    } catch (_) {}
    try { MailApp.sendEmail(COACH_EMAIL, 'Assessment delivery needs attention', 'A submission could not be processed. Error: ' + error.message); } catch (_) {}
    return json_({ok:false,error:String(error)});
  }
}
function buildEvidenceSummary_(data) {
  var entries = Object.keys(data.scores).map(function(k){return [k,data.scores[k]]}).sort(function(a,b){return b[1]-a[1]});
  return 'Responses most strongly support '+entries.slice(0,3).map(function(x){return x[0].toLowerCase()}).join(', ')+'. Lower-scoring areas are development priorities, not fixed limitations.';
}
function createProfilePdf_(data, narrative) {
  var report = data.report || {};
  var doc = DocumentApp.create(data.player.name + ' - Player Development Profile');
  var body = doc.getBody();
  body.appendParagraph('CASTRO PLAYER DEVELOPMENT').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(data.player.name).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('Player Development Profile');
  addSection_(body, data.archetype || 'Developing Profile', report.summary || narrative);
  body.appendParagraph('Archetype mix').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  (data.archetypeMatches || []).forEach(function(x,i){body.appendParagraph((i===0?'Leading match: ':'Also present: ')+x.name+' ('+x.match+'% relative match)').setHeading(DocumentApp.ParagraphHeading.HEADING2);body.appendParagraph(x.description || '');});
  addSection_(body,'Learning & communication',(report.learning || '')+'\n\n'+(report.communication || ''));
  addSection_(body,'Mental game','Under pressure: '+(report.pressure || '')+'\n\nAfter a mistake: '+(report.mistakes || '')+'\n\nStaying focused: '+(report.focus || ''));
  addSection_(body,'Team dynamics','Likely role: '+(report.role || '')+'\n\nLeadership: '+(report.leadership || '')+'\n\n'+(report.teamwork || ''));
  body.appendParagraph('Support at home').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  (report.parent || []).forEach(function(x){body.appendListItem(x)});
  body.appendListItem('Use the archetype as a conversation starter, not a permanent description.');
  body.appendParagraph('Development opportunities').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  (report.priorities || []).forEach(function(x){body.appendParagraph(x.name).setHeading(DocumentApp.ParagraphHeading.HEADING2);body.appendParagraph(x.text)});
  addSection_(body,'Closing note','Use this profile as a shared starting point. Test the ideas in training, notice what changes, and reassess with fresh evidence over time.');
  doc.saveAndClose();
  var file = DriveApp.getFileById(doc.getId());
  var blob = file.getAs(MimeType.PDF).setName(data.player.name.replace(/[^a-z0-9]/gi,'-')+'-Player-Profile.pdf');
  file.setTrashed(true);
  return blob;
}
function addSection_(body,title,text){body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);body.appendParagraph(text || '')}
function escapeHtml_(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}
