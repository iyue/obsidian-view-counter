import {App, Modal, Plugin, PluginSettingTab, Setting} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	// mySetting: string;
	viewCountKey: string;
	lastViewDateKey: string;
	interval: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	// mySetting: '',
	viewCountKey: "view_count",
	lastViewDateKey: "last_view_date",
	interval: '120',
}

function log(e: any) {
	if ((window as any)._debug) {
		console.log(e);
	}
}

function formatDate(date: Date) {
	return date.getFullYear() +
		"-" +
		String(date.getMonth() + 1).padStart(2, '0') +
		"-" +
		String(date.getDate()).padStart(2, '0') +
		" " +
		String(date.getHours()).padStart(2, '0') +
		":" +
		String(date.getMinutes()).padStart(2, '0') +
		":" +
		String(date.getSeconds()).padStart(2, '0');
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		const _this = this;
		await this.loadSettings();

		const app = this.app;
		app.workspace.on('file-open', (file) => {
			log(file);
			if(file?.extension !== 'md') {
				return;
			}
			let isExclude = false;

			// // 过滤文件
			// this.settings.mySetting.split(',').forEach(folder => {
			// 	if(folder.trim() !== '' && file?.path.startsWith(folder.trim())) {
			// 		isExclude = true;
			// 		return;
			// 	}
			// })
			// if(isExclude) {
			// 	return;
			// }
			app.fileManager.processFrontMatter(file, (metadata) => {
				log(metadata);
				const viewCountKey = _this.settings.viewCountKey;
				const viewCount = metadata[viewCountKey];
				if (!viewCount) {
					metadata[viewCountKey] = 1;
				}
				const lastViewTimeKey = _this.settings.lastViewDateKey;
				const lastViewTime = metadata[lastViewTimeKey];
				if (!lastViewTime) {
					metadata[lastViewTimeKey] = formatDate(new Date());
				}
				const lastViewDate = new Date(metadata[lastViewTimeKey]);
				const timeDiff = (new Date().getTime() - lastViewDate.getTime()) / (1000 * 60);
				// 如果间隔大于预设, 则更新数据
				if (timeDiff >= Number(_this.settings.interval)) {
					metadata[viewCountKey] += 1;
					metadata[lastViewTimeKey] = formatDate(new Date());
				}
			})
		})

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('ViewCounter');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for ViewCounter.' });

		// new Setting(containerEl)
		// 	.setName('files to exclude')
		// 	.setDesc('you do not want log')
		// 	.addText(text => text
		// 		.setPlaceholder('e.g. DailyNotes, Readwise/Articles')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			log('Secret: ' + value);
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));

		new Setting(containerEl)
			.setName('interval')
			.setDesc('时间间隔')
			.addText(text => text
				.setPlaceholder('e.g. interval')
				.setValue(this.plugin.settings.interval)
				.onChange(async (value) => {
					log('Secret: ' + value);
					this.plugin.settings.interval = value || DEFAULT_SETTINGS.interval;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('viewCount name')
			.setDesc('custom log key name')
			.addText(text => text
				.setPlaceholder('e.g. view_count')
				.setValue(this.plugin.settings.viewCountKey)
				.onChange(async (value) => {
					log('Secret: ' + value);
					this.plugin.settings.viewCountKey = value || DEFAULT_SETTINGS.viewCountKey;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('lastViewDate name')
			.setDesc('custom log key name')
			.addText(text => text
				.setPlaceholder('e.g. last_view_date')
				.setValue(this.plugin.settings.lastViewDateKey)
				.onChange(async (value) => {
					log('Secret: ' + value);
					this.plugin.settings.lastViewDateKey = value || DEFAULT_SETTINGS.lastViewDateKey;
					await this.plugin.saveSettings();
				}));
	}
}
