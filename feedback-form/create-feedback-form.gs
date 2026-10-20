/**
 * Al Adrak website feedback form.
 *
 * Creates a short Google Form (three questions, under a minute to fill in) and a
 * Google Sheet that collects the answers.
 *
 * HOW TO RUN (once, with the Google account that should own the form):
 *   1. Go to https://script.google.com and press "New project".
 *   2. Delete the sample code, paste this whole file in, and press Save.
 *   3. Choose the function  createFeedbackForm  at the top and press Run.
 *   4. Google asks for permission the first time. Choose your account, then
 *      "Advanced" > "Go to ... (unsafe)" > Allow. (It says unsafe only because
 *      you wrote the script yourself and Google has not reviewed it.)
 *   5. Open "Execution log" at the bottom: it prints the link to SHARE, the link
 *      to EDIT the form, and the link to the answers sheet.
 *
 * Then paste the share link into your email. Answers appear in the sheet.
 */

function createFeedbackForm() {
  var form = FormApp.create("Al Adrak Website - Your Feedback");

  form.setDescription(
    "Thank you for looking at the new Al Adrak website. Your honest opinion helps us make it better."
  );
  form.setConfirmationMessage("Thank you - your feedback has been sent to the Al Adrak team.");
  form.setCollectEmail(false);            // no sign-in or email needed to answer
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);

  // 1. overall rating (the only required question)
  form.addScaleItem()
    .setTitle("Overall, what do you think of the new Al Adrak website?")
    .setBounds(1, 5)
    .setLabels("Poor", "Excellent")
    .setRequired(true);

  // 2. and 3. open comments
  form.addParagraphTextItem().setTitle("What did you like most?");
  form.addParagraphTextItem().setTitle("What should we improve, change or add?");

  // answers go to a Google Sheet
  var sheet = SpreadsheetApp.create("Al Adrak Website Feedback - Answers");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log("SHARE THIS LINK (for your email):  " + form.getPublishedUrl());
  Logger.log("Edit the form:                     " + form.getEditUrl());
  Logger.log("Answers sheet:                     " + sheet.getUrl());
}
