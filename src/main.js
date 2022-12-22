/* main.js
 *
 * Copyright 2022 xaviju
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";
import Adw from "gi://Adw?version=1";
import Gdk from "gi://Gdk";

import "./welcome-widget.js";
import "./github-widget.js";
import "./taiga-widget.js";
import { KpaddWindow } from "./window.js";

pkg.initGettext();
pkg.initFormat();

export const KpaddApplication = GObject.registerClass(
  class KpaddApplication extends Adw.Application {
    constructor() {
      super({
        application_id: "net.kaleidos.kpadd",
        flags: Gio.ApplicationFlags.FLAGS_NONE,
      });

      const quit_action = new Gio.SimpleAction({ name: "quit" });
      quit_action.connect("activate", (action) => {
        this.quit();
      });
      this.add_action(quit_action);
      this.set_accels_for_action("app.quit", ["<primary>q"]);

      const show_about_action = new Gio.SimpleAction({ name: "about" });
      show_about_action.connect("activate", (action) => {
        let aboutParams = {
          transient_for: this.active_window,
          application_name: "kpadd",
          application_icon: "net.kaleidos.kpadd",
          developer_name: "xaviju",
          version: "0.1.0",
          developers: ["xaviju"],
          copyright: "© 2022 xaviju",
        };
        const aboutWindow = new Adw.AboutWindow(aboutParams);
        aboutWindow.present();
      });
      this.add_action(show_about_action);
    }

    vfunc_startup() {
      super.vfunc_startup();
      this.#loadStylesheet();
    }

    vfunc_activate() {
      let { active_window } = this;

      if (!active_window) active_window = new KpaddWindow(this);

      active_window.present();
    }

    #loadStylesheet() {
      // Load the stylesheet in a CssProvider
      const provider = new Gtk.CssProvider();
      provider.load_from_resource("/net/kaleidos/kpadd/css/style.css");

      // Add the provider to the StyleContext of the default display
      Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(),
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
      );
    }
  }
);

export function main(argv) {
  const application = new KpaddApplication();
  return application.run(argv);
}
