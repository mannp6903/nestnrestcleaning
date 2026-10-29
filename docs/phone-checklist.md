# 10-minute phone check

The automated checks in `tools/qa` cover screen widths, enlarged text, keyboard use and an accessibility scan. They can't use a real phone keyboard, autofill or a screen reader, so run this on your own phone after a big change. Use the live site, or the preview link Claude sends you.

Note anything that looks wrong or confusing (a screenshot helps) and send it to Claude.

## 1. Book to the last step (3 minutes)

1. Open the home page. In the price box, change bedrooms and bathrooms.
   - The big number should be the first-visit price.
   - "Regular price" should sit under it.
2. Tap **Choose your time**.
   - Type your postal code with the phone keyboard. A postal-style keyboard is a plus.
   - Tap Continue.
3. Pick a day and an arrival time, then tap Continue.
4. On Your details, let the phone autofill your name, phone and address if it offers to.
   - Pick a pet and type a short note.
5. Check that **Check your clean** shows your Pets choice and your note.
   - Tap one of its **Edit** links: it should jump to that field.
6. Don't send it (unless the Google Sheet is switched on and you want a test row).

## 2. Text me this price (1 minute)

On the home page, tap **Text me this price**. The phone number box should open and be easy to type in. Don't send it.

## 3. A large home (2 minutes)

1. Start a booking, tick **Over about 3,000 sq ft**, and tap **Get a Residence Care quote**.
2. On the quote form, check:
   - your postal code and "How often" are filled in;
   - the notes start with "From the booking form";
   - the other dropdowns say "Choose one".
3. The page address should end in `?from=booking`, with no details in it.

## 4. Dark mode and bigger text (2 minutes)

1. Tap the moon button and look over the home page and the booking form in dark mode. Then switch back.
2. In your phone's settings, turn the text size up to one of the largest settings.
   - **iPhone:** Settings → Display & Brightness → Text Size.
   - **Android:** Settings → Display → Font size.
3. Reload the site. Nothing should run off the side, and the Continue button shouldn't be hidden. Then turn the text size back down.

## 5. Screen reader (2 minutes)

1. Turn on **VoiceOver** (iPhone: Settings → Accessibility → VoiceOver) or **TalkBack** (Android: Settings → Accessibility → TalkBack).
2. On the home page, change the bedrooms: the new price should be read out.
3. In the booking form, leave the postal code empty and press Continue: the problem should be read out.
4. On Your details, swipe through **Check your clean**: each row should be read with its label and value.
5. Turn the screen reader off. On iPhone you can triple-click the side button if you set that shortcut up.
