import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=2.4";
import Adw from "gi://Adw";
import Gio from "gi://Gio";

export const GithubWidget = GObject.registerClass(
  {
    GTypeName: "KpaddGithubWidget",
    CssName: "github",
    Template: "resource:///net/kaleidos/kpadd/gtk/github-widget.ui",
    InternalChildren: ["pullRequests"],
  },
  class extends Gtk.Widget {
    constructor() {
      super();

      this.#getPullRequests();
    }

    #getPullRequests() {
      const session = new Soup.Session();
      const url = `https://api.github.com/repos/taigaio/taiga-back/pulls`;

      const message = new Soup.Message({
        method: "GET",
        uri: new Soup.URI(url),
      });

      message.request_headers.append(
        "Authorization",
        "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"
      );

      message.request_headers.append("User-Agent", "Kpadd/0.1");
      message.request_headers.append("Accept", "application/vnd.github+json");
      message.request_headers.append("X-GitHub-Api-Version", "2022-11-28");

      session.queue_message(message, (session, message) => {
        const data = JSON.parse(message.response_body.data);
        data.forEach((item) => {
          let PRCreateDateTime = GLib.DateTime.new_from_iso8601(
            item.created_at,
            null
          );
          let currentDateTime = GLib.DateTime.new_now_local();
          let milli = Math.abs(
            PRCreateDateTime.difference(currentDateTime) / 1000
          );
          const diffDate = this.getDuration(milli);

          const avatar = new Adw.Avatar({
            text: item.user.login,
            show_initials: true,
            size: 32,
          });

          let ctaButton = new Gtk.LinkButton({
            css_classes: ["flat"],
            uri: item.html_url,
            child: new Adw.ButtonContent({
              icon_name: "view-dual-symbolic",
              label: _("Review"),
            }),
          });

          const wrapperBox = new Adw.ActionRow({
            title: item.title,
            subtitle: `#${item.number} by ${item.user.login} in ${item.base.repo.name} ${diffDate.value} ${diffDate.unit} ago`,
          });

          wrapperBox.add_suffix(ctaButton);
          wrapperBox.add_prefix(avatar);

          this._pullRequests.append(wrapperBox);
        });
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
