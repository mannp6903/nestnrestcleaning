# Saving website requests to your Google Sheet

Once this is set up, every form on the website (bookings, quote requests, gift card requests, reviews and "Text me this price") is saved as a row in a Google Sheet you own. You also get an alert email for each one. Customers who give an email address get a short receipt from your Gmail that says their request arrived and isn't confirmed yet. Nothing is lost if an email fails: the row is already saved, and the email is retried every 15 minutes.

It takes about 15 minutes. Do it on a computer, signed in to the Google account that should own the requests, such as nestnrestcleaning@gmail.com.

## Set it up

1. **Create the sheet.** Go to sheets.google.com, start a blank spreadsheet, and name it **Nest & Rest requests**.
2. **Add the script.**
   - In the sheet, open **Extensions → Apps Script**.
   - Delete the sample code, then paste in the whole of `tools/sheet/Code.gs` from the website's repository.
   - Click **Save** (the disk icon).
3. **Run setup once.**
   - In the function menu at the top, choose **setup**, then click **Run**.
   - Google asks for permission because the script reads and writes this sheet, sends email as you, and runs on a timer. Choose your account.
   - If you see "Google hasn't verified this app", click **Advanced → Go to (project name)**. It's your own script.
   - When it finishes, the sheet has five tabs: Bookings, Quotes, Gifts, Reviews and Price texts.
4. **Publish it.**
   - Click **Deploy → New deployment**.
   - Choose the type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
   - Copy the **Web app URL**. It ends in `/exec`.
5. **Connect the website.** Send that address to Claude and ask to switch the site to the sheet. Or edit it in yourself:
   - In `js/config.js`, set `delivery` to `{ provider: "sheet", endpoint: "<your /exec address>" }`.
   - Run `node tools/build.mjs`, commit and push.
   - The privacy notes on the forms update to name your Google Sheet and Gmail.
6. **Test it once.** On the live site, send a booking request with your own email.
   - Check that a row appears in Bookings, that you got the alert, and that the receipt arrived.
   - Then set that row's Status to **Done**.

## Day to day

- **Status:** change it as you reply. Bookings go Received → Confirmed, Other time offered, Declined or Cancelled → Done. Each tab has its own list.
- **Confirmed time and Final price:** fill these in on Bookings once you've agreed them with the customer.
- **Morning email:** every day at 9am, if any booking or quote is still "Received" after 2 hours, or an email couldn't be sent, you get one email listing them. If there's nothing to chase, you get nothing.
- **Your own columns:** you can move columns, hide them or add your own. The script finds its columns by their names in row 1, so don't rename those.
- **Hand-added rows:** rows you type in yourself, such as a phone booking, are never emailed.

## Good to know

- **Who sees it:** the sheet holds customers' names, phone numbers and addresses. Share it only with people who need it.
- **A different alert address:** open **Project Settings → Script properties**, then add `OWNER_EMAIL` with the address.
- **Changing the script later:** paste the new code, then go to **Deploy → Manage deployments**, edit the existing one, choose **New version** and click **Deploy**. The address stays the same, so the website needs no change.
- **Receipt limits:** a customer gets at most one receipt an hour, and the script sends at most 50 receipts a day. This stops anyone using the website to flood someone's inbox. You still get every alert.
- **To stop using the sheet:** set `provider` back to `"formsubmit"` in `js/config.js`, rebuild and push. The sheet keeps everything already saved.
