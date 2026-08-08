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
  var pdf = createProfilePdf_(data, narrative);
  MailApp.sendEmail({to:data.player.email,subject:subject,htmlBody:html,attachments:[pdf],name:'Castro Player Development'});
  var coachHtml = '<div style="font-family:Arial;color:#16263a;max-width:620px"><h2>New player assessment completed</h2><p><b>Player:</b> '+escapeHtml_(data.player.name)+'</p><p><b>Primary archetype:</b> '+escapeHtml_(data.archetype || 'Developing Profile')+'</p><p><b>Completed:</b> '+escapeHtml_(new Date(data.completedAt).toLocaleString())+'</p><p><b>Submission ID:</b> '+escapeHtml_(id)+'</p><p>The complete report is attached and the responses are saved in your private assessment Sheet.</p></div>';
  MailApp.sendEmail({to:COACH_EMAIL,subject:'New assessment — '+data.player.name,htmlBody:coachHtml,attachments:[pdf.copyBlob()],name:'Castro Player Development'});
  sheet.getRange(sheet.getLastRow(), 16).setValue('Family emailed; coach notified');
  return json_({ok:true,emailSent:true,coachNotified:true,id:id});
  } catch (error) {
    try { MailApp.sendEmail(COACH_EMAIL, 'Assessment delivery needs attention', 'A submission could not be processed. Error: ' + error.message); } catch (_) {}
    return json_({ok:false,error:String(error)});
  }
}
function buildEvidenceSummary_(data) {
  var entries = Object.keys(data.scores).map(function(k){return [k,data.scores[k]]}).sort(function(a,b){return b[1]-a[1]});
  return 'Responses most strongly support '+entries.slice(0,3).map(function(x){return x[0].toLowerCase()}).join(', ')+'. Lower-scoring areas are development priorities, not fixed limitations.';
}
function createProfilePdf_(data, narrative) {
  var entries = Object.keys(data.scores).map(function(k){return [k,data.scores[k]]}).sort(function(a,b){return b[1]-a[1]});
  var bars = entries.slice(0,10).map(function(x){return '<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>'+escapeHtml_(x[0])+'</span><span>'+x[1]+'/100</span></div><div style="height:7px;background:#e2e8f0;margin-top:5px"><div style="height:7px;width:'+x[1]+'%;background:#115ba8"></div></div></div>'}).join('');
  var priorities = entries.slice(-5).reverse().map(function(x,i){return '<div style="border-top:1px solid #d8e0ea;padding:14px 0"><b>0'+(i+1)+' &nbsp; '+escapeHtml_(x[0])+'</b><p style="color:#586a7e">Practice one small, visible behavior before each session and review a real example afterward. Progress may look like fewer reminders, quicker recovery, or more frequent use in game-like moments.</p></div>'}).join('');
  var report = '<html><body style="font-family:Arial;color:#16263a;margin:0"><div style="background:#0a2342;color:white;padding:55px 45px;height:230px"><div style="font-size:12px;letter-spacing:2px">CASTRO PLAYER DEVELOPMENT</div><h1 style="font-size:40px;margin:65px 0 5px">'+escapeHtml_(data.player.name)+'</h1><div>Player Development Profile</div></div><div style="padding:38px 45px"><h2>Executive summary</h2><p style="line-height:1.65;color:#586a7e">'+escapeHtml_(narrative)+'</p><div style="background:#edf5fc;border-left:4px solid #115ba8;padding:14px;margin:22px 0">This profile describes this set of answers on this date. It is not a diagnosis, prediction, or permanent label.</div><h2 style="margin-top:34px">Core indicators</h2>'+bars+'<h2 style="margin-top:38px">Development priorities</h2>'+priorities+'<h2 style="margin-top:38px">Closing note</h2><p style="line-height:1.65;color:#586a7e">Use these findings as a shared starting point. Test the ideas in training, notice what changes, and reassess with fresh evidence over time.</p></div></body></html>';
  return HtmlService.createHtmlOutput(report).getBlob().getAs(MimeType.PDF).setName(data.player.name.replace(/[^a-z0-9]/gi,'-')+'-Player-Profile.pdf');
}
function escapeHtml_(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}
