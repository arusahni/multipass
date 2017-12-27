# Multipass - Multifactor Authentication Checker for LastPass

*This is neither affiliated with, nor endorsed by, LastPass.*

Determine which of the accounts stored in your LastPass vault support some form
of multifactor authentication.

## Getting Started

1. Install the extension.
    * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/multipass-mfa/)
    * [Chrome](https://chrome.google.com/webstore/detail/multipass/icaodbnoalimdopaklokefncjieiimle)
2. Log in to the [LastPass website](https://lastpass.com/?&ac=1&lpnorefresh=1&fromwebsite=1&newvault=1&nk=1)
(not through the extension).
3. Click the "Multipass" link in the left sidebar.
4. Interact with MFA-compatible accounts:
    * Clicking on an entry will open a new window for the service (the `URL`
      field for the saved account).
    * Clicking the information button at the far right of an entry (if present)
      will take you to a help page for the service.
    * Hovering over a red asterisk on the line of supported MFA methods will
      present you with caveats for the site.

## A Note on Security

You should always be cautious when granting access to sensitive data to third
party extensions (such as this one). Multipass was developed with that concern
in mind, and takes the following measures:

* Passwords are never referenced or extracted - only the service URL, name, and
  usernames get accessed.
* **The extension never communicates with non-LastPass servers.** It only has
  permission to run in the context of your LastPass tab.
* The extension doesn't cache any data locally.  This prevents leaking of data
  even if you're logged out of your vault.
* The underlying code is constructed in a straightforward manner and served
  unobfuscated, improving transparency. Users should be able to unpack the
  extension and audit it themselves.
* No untrusted third party dependencies. All third party code was reviewed and
  is vendorized.

If you have a security concern, please open an issue. If it's sensitive, please
email me: `aru at arusahni.net`.

## FAQ

**Q**: I know a service supports MFA, why isn't it recognized as such by Multipass?  
**A**: First, check the URL of the saved site for correctness. Second, check
[TwoFactorAuth.org](http://twofactorauth.org/) to see if the service is listed.
If not, follow the instructions on the site and submit an issue to have the
site added. If the site is listed, please file an issue with Multipass. Odds
are that the database is out of date, and a new release needs to be cut.

**Q**: Can you support *{password manager}*?  
**A**: I hope so! While Multipass
was originally developed with LastPass in mind, there's nothing preventing it
from working with other web-based password managers. Please file an issue for
your service of choice and I'll see what I can do.  Pull requests are welcome,
too!

## License

This project is licensed under the GNU General Public License v3.0.

See [COPYING](COPYING) for more info.

## Acknowledgements

* [TwoFactorAuth.org](https://github.com/2factorauth/twofactorauth) - Mad props
  for their MIT-licensed data.
* [parse-domain](https://github.com/peerigon/parse-domain) - 'Unlicense' code
  used with many thanks.


![Analytics](https://ga-beacon.appspot.com/UA-46766795-1/multipass/README?pixel)
