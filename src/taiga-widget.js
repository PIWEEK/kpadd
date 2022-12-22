import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=2.4";
import Adw from "gi://Adw";
import Gio from "gi://Gio";

import { taigaUser } from "./config/config.js";

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
      const message = new Soup.Message({
        method: "POST",
        uri: new Soup.URI(url),
      });
      const authData = JSON.stringify({
        password: taigaUser.password,
        type: "normal",
        username: taigaUser.username,
      });

      message.request_headers.append("Content-Type", "application/json");
      message.request_body.append(authData);

      session.queue_message(message, (session, message) => {
        const data = JSON.parse(message.response_body.data);
        // console.log(data);

        this.getTasks(data);
      });
    }

    getTasks(data) {
      const session = new Soup.Session();
      // const url = `https://api.taiga.io/api/v1/userstories?assigned_users=${data.id}&dashboard=true&is_closed=false`;
      // const url = `https://  api.taiga.io/api/v1/tasks?assigned_to=${data.id}&status__is_closed=false`;
      const url = `https://api.taiga.io/api/v1/issues?assigned_to=${data.id}&status__is_closed=false`;
      const message = new Soup.Message({
        method: "GET",
        uri: new Soup.URI(url),
      });
      message.request_headers.append("Content-Type", "application/json");
      message.request_headers.append(
        "Authorization",
        `Bearer ${data.auth_token}`
      );

      session.queue_message(message, (session, message) => {
        const response = JSON.parse(message.response_body.data);

        const data = response.sort(function (a, b) {
          const date1 = new Date(a.created_date);
          const date2 = new Date(b.created_date);

          return date2 - date1;
        });

        this.displayTasks(data);
      });
    }

    displayTasks(data) {
      data.forEach((item) => {
        const avatar = new Adw.Avatar({
          text: item.project_extra_info.name,
          show_initials: true,
          size: 32,
        });

        let ctaButton = new Gtk.LinkButton({
          css_classes: ["flat"],
          uri: `https://tree.taiga.io/project/${item.project_extra_info.slug}/issue/${item.ref}`,
          child: new Adw.ButtonContent({
            icon_name: "checkbox-checked-symbolic",
            label: _("Visit"),
          }),
        });

        let PRCreateDateTime = GLib.DateTime.new_from_iso8601(
          item.created_date,
          null
        );
        let currentDateTime = GLib.DateTime.new_now_local();
        let milli = Math.abs(
          PRCreateDateTime.difference(currentDateTime) / 1000
        );
        const diffDate = this.getDuration(milli);

        const wrapperBox = new Adw.ActionRow({
          title: item.subject,
          subtitle: `#${item.ref} created by ${item.owner_extra_info.full_name_display} in ${item.project_extra_info.name} ${diffDate.value} ${diffDate.unit} ago`,
        });

        wrapperBox.add_suffix(ctaButton);
        wrapperBox.add_prefix(avatar);

        this._tasks.append(wrapperBox);
      });
    }

    getDuration(milli) {
      let minutes = Math.floor(milli / 60000);
      let hours = Math.round(minutes / 60);
      let days = Math.round(hours / 24);

      return (
        (days && { value: days, unit: "days" }) ||
        (hours && { value: hours, unit: "hours" }) || {
          value: minutes,
          unit: "minutes",
        }
      );
    }
  }
);
