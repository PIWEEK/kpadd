import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=3.0";
import Adw from "gi://Adw";
import Gio from "gi://Gio";

import { taigaUser } from "./config/config";

export const TaigaWidget = GObject.registerClass(
  {
    GTypeName: "KpaddTaigaWidget",
    CssName: "taiga",
    Template: "resource:///net/kaleidos/kpadd/gtk/taiga-widget.ui",
    InternalChildren: ["tasks"],
  },
  class extends Gtk.Widget {
    constructor() {
      super();

      this.#login();
    }

    #login() {
      console.log("get taiga!");

      const session = new Soup.Session();
      const url = `https://api.taiga.io/api/v1/auth`;
      const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
      const message = new Soup.Message({
        method: "POST",
        uri,
      });
      const authData = JSON.stringify({
        password: taigaUser.password,
        type: "normal",
        username: taigaUser.username,
      });

      message.request_headers.append("Content-Type", "application/json");
      message.set_request_body(authData, null, null);
      const bytes = session.send_and_read(message, null);
      const decoder = new TextDecoder("utf-8");
      const result = decoder.decode(bytes.get_data());
      const auth = JSON.parse(result);

      console.log({ auth });
    }

    // #getPullRequests() {
    //   console.log("get PRS!");

    //   const session = new Soup.Session();
    //   const url = `https://api.github.com/repos/taigaio/taiga-back/pulls`;
    //   const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
    //   const message = new Soup.Message({
    //     method: "GET",
    //     uri,
    //   });

    //   message.request_headers.append(
    //     "Authorization",
    //     "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"
    //   );

    //   message.request_headers.append("User-Agent", "Kpadd/0.1");
    //   message.request_headers.append("Accept", "application/vnd.github+json");
    //   message.request_headers.append("X-GitHub-Api-Version", "2022-11-28");

    //   const bytes = session.send_and_read(message, null);
    //   const decoder = new TextDecoder("utf-8");
    //   const result = decoder.decode(bytes.get_data());
    //   const data = JSON.parse(result);

    //   data.forEach((item) => {
    //     let PRCreateDateTime = GLib.DateTime.new_from_iso8601(
    //       item.created_at,
    //       null
    //     );
    //     let currentDateTime = GLib.DateTime.new_now_local();
    //     let milli = Math.abs(
    //       PRCreateDateTime.difference(currentDateTime) / 1000
    //     );
    //     const diffDate = this.getDuration(milli);

    //     const avatar = new Adw.Avatar({
    //       text: item.user.login,
    //       show_initials: true,
    //       size: 32,
    //     });

    //     let ctaButton = new Gtk.LinkButton({
    //       css_classes: ["flat"],
    //       uri: item.html_url,
    //       child: new Adw.ButtonContent({
    //         icon_name: "view-dual-symbolic",
    //         label: _("Review"),
    //       }),
    //     });

    //     const wrapperBox = new Adw.ActionRow({
    //       title: item.title,
    //       subtitle: `#${item.number} by ${item.user.login} in ${item.base.repo.name} ${diffDate.value} ${diffDate.unit} ago`,
    //     });

    //     wrapperBox.add_suffix(ctaButton);
    //     wrapperBox.add_prefix(avatar);

    //     this._pullRequests.append(wrapperBox);
    //   });
    // }

    // getDuration(milli) {
    //   let minutes = Math.floor(milli / 60000);
    //   let hours = Math.round(minutes / 60);
    //   let days = Math.round(hours / 24);

    //   return (
    //     (days && { value: days, unit: "days" }) ||
    //     (hours && { value: hours, unit: "hours" }) || {
    //       value: minutes,
    //       unit: "minutes",
    //     }
    //   );
    // }
  }
);
