# Quick Price Check

Quickly cross reference various prices on technology products and get alerts when items go below a certain price.

## Supported Sites

* [Amazon](https://www.amazon.com/)
* [Newegg](https://www.newegg.com/)
* [Micro Center](http://www.microcenter.com/)
* [Tiger Direct](http://www.tigerdirect.com/)
* [B&H](https://www.bhphotovideo.com/)
* [Best Buy](https://www.bestbuy.com/)

## Settings & Setup

1) Copy and rename `db.example.json` to `db.json`
2) Create a [MailGun](https://app.mailgun.com/sessions/new) account
3) If you're using the Sandbox Domain, you'll need to add an [Authorized Recipient](https://help.mailgun.com/hc/en-us/articles/217531258)
4) Enter your domain, private API key, and authorized recipient email address to `db.json`. You can find your API key in the [Control Panel](https://app.mailgun.com/app/dashboard)