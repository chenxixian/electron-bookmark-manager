
import { Component, OnInit, OnChanges, NgZone, Output, Input, HostListener, EventEmitter, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonService } from '../shared/button.service';
import { TabService } from '../shared/tab.service';

import { NgForm, FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { SettingsService, hasSpace, hasPlus, hasValid } from '../shared/settings.service';

declare var ipcRenderer: any;
declare var remote: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnChanges {

    @HostBinding('class') classes = 'homeClass'; // todo remove

    @Input() guy: string = "Home"

    private ipc_info: string;
    private remote_info: string;
    private count: number;

    buttonForm: FormGroup;
    buttonUpdateForm: FormGroup;

    modal: boolean = false;
    selectedButton: any = null;

    options;

    tab: any;

    // Default Color for Picker
    color: string = '#2889e9';

    settings = {
        theme: '',
        buttonSize: ''
    }

    constructor(public buttonService: ButtonService, public tabService: TabService, private router: Router, private fb: FormBuilder, public settingsService: SettingsService) {
        this.tab = tabService.currentTab;
        this.options = {
            onUpdate: (event: any) => {
                this.buttonService.changeOrder(this.buttonService.sortedList, this.tabService.currentTab);
            }
        };
    }

    ngOnInit() {
        this.settingsService.changeSettings();
        this.tab = this.tabService.currentTab;

        this.buttonForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(15)]],
            url: ['', Validators.required],
            color: ['', Validators.required],
            shortcut: ['', [hasValid]],
            category: ['']
        });

        this.buttonUpdateForm = this.fb.group({
            name: ['', Validators.required],
            url: ['', Validators.required],
            color: ['', Validators.required],
            shortcut: [''],
            category: ['']
        });
    }

    ngOnChanges() {
        this.tab = this.tabService.currentTab;
    }

    openModal(modaltype: string) {
        if (modaltype === 'addbutton') {
            this.buttonForm.patchValue({
                category: this.tabService.currentTab
            });
            this.modal = !this.modal;
        } else if (modaltype === 'editbutton') {
            this.buttonService.editmodal = !this.buttonService.editmodal;
        }
    }

    closeModal(modaltype: string) {
        if (modaltype === 'addbutton') {
            this.modal = !this.modal;
            this.buttonForm.reset();
            this.buttonUpdateForm.reset();
        } else if (modaltype === 'editbutton') {
            this.buttonService.editmodal = !this.buttonService.editmodal;
            this.buttonUpdateForm.reset();
            this.buttonForm.reset();
        }
    }

    getClass() {
        if (this.tabService.editMode) {
            if (this.settingsService.settings.buttonSize === 'Small') {
                return ['btn-sm', 'edit'];
            } else {
                return 'edit';
            }
        } else {
            if (this.settingsService.settings.buttonSize === 'Small') {
                return 'btn-sm';
            } else {
                return '';
            }
        }
    }

    onUpdate() {
        this.buttonService.editmodal = !this.buttonService.editmodal;

        let updatedButton = {
            name: this.buttonUpdateForm.value.name,
            url: this.buttonUpdateForm.value.url,
            color: this.buttonUpdateForm.value.color,
            category: this.buttonUpdateForm.value.category,
            shortcut: null,
            id: this.selectedButton.id
        }

        if (this.buttonUpdateForm.value.shortcut) {
            updatedButton.shortcut = this.buttonUpdateForm.value.shortcut.toLowerCase()
        }

        this.buttonUpdateForm.reset();

        this.buttonService.update(updatedButton, 0);
    }

    onSubmit() {
        this.modal = !this.modal;

        let newButton = {
            name: this.buttonForm.value.name,
            url: this.buttonForm.value.url,
            color: this.buttonForm.value.color,
            category: this.buttonForm.value.category,
            shortcut: null,
            id: this.buttonService.guidGenerator(),
        }

        if (this.buttonForm.value.shortcut) {
            newButton.shortcut = this.buttonForm.value.shortcut;
        }

        this.buttonForm.reset();

        this.buttonService.add(newButton);
    }

    onDelete() {
        this.buttonService.editmodal = !this.buttonService.editmodal;

        this.buttonUpdateForm.reset();

        this.buttonService.delete(this.selectedButton, 0)
    }

    buttonClick(site) {

        if (!this.tabService.editMode) {
            this.settingsService.openLink(site.url);
        } else {
            this.buttonUpdateForm.patchValue({
                name: site.name,
                url: site.url,
                color: site.color,
                shortcut: site.shortcut,
                category: site.category
            });
            this.selectedButton = site;
            this.openModal('editbutton');
        }
    }

    isSelected(tabname: string) {
        if (this.selectedButton) {
            if (tabname === this.selectedButton.category) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    openEditModal() {
        this.buttonService.editmodal = !this.buttonService.editmodal;
    }
}

