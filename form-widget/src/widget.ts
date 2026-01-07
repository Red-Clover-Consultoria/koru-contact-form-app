import { KoruWidget, WidgetConfig } from '@redclover/koru-sdk';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ContactForm from './ContactForm';

class ContactFormWidget extends KoruWidget {
    private root: Root | null = null;
    private formConfig: any = null;

    constructor() {
        super({
            name: 'koru-contact-form',
            version: '1.0.0',
            options: { debug: true, cache: true }
        });
        console.log('[ContactFormWidget] Instance created');
    }

    async start(): Promise<void> {
        console.log('[ContactFormWidget] start()');
        // The base class handles authentication and lifecycle (onInit, onRender)
        return super.start();
    }

    async onInit(config: WidgetConfig) {
        console.log('[ContactFormWidget] onInit()', config);
        if (!this.authData) return;

        // Find the container if it's not already set
        if (!this.container) {
            this.container = document.querySelector('.koru-contact-form');
            console.log('[ContactFormWidget] Container found:', this.container);
        }

        if (!this.container) {
            console.error('[ContactFormWidget] No container found. Please add <div class="koru-contact-form"></div> to your page.');
            return;
        }

        this.showLoading();

        try {
            // Use custom_data (form slug) if available, otherwise appId
            const formIdentifier = this.authData.custom_data || this.authData.app.id;
            const websiteId = this.authData.website.id;

            console.log(`[ContactFormWidget] Fetching config for: ${formIdentifier}`);

            // Fetch configuration from the backend
            const response = await fetch(
                `https://koru-contact-form-app-production.up.railway.app/api/forms/config/${formIdentifier}?websiteId=${websiteId}`
            );

            if (!response.ok) throw new Error(`Config fetch failed: ${response.status}`);

            this.formConfig = await response.json();
            console.log('[ContactFormWidget] Config received:', this.formConfig);
        } catch (err) {
            console.error('[ContactFormWidget] Init error:', err);
            this.showErrorMessage('No se pudo cargar la configuración del formulario.');
        }
    }

    async onRender(config: WidgetConfig) {
        console.log('[ContactFormWidget] onRender()');

        if (!this.container || !this.formConfig || !this.authData) return;

        // Clear container and mount React
        this.container.innerHTML = '';
        this.root = createRoot(this.container);
        this.root.render(
            React.createElement(
                React.StrictMode,
                null,
                React.createElement(ContactForm, {
                    config: this.formConfig,
                    websiteId: this.authData.website.id,
                    appId: this.authData.app.id,
                    formId: this.formConfig.formId
                })
            )
        );
    }

    async onDestroy() {
        console.log('[ContactFormWidget] onDestroy()');
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    // UI Helpers
    private showLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; animate: spin 1s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `;
    }

    private showErrorMessage(message: string) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="padding: 16px; color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; font-size: 14px; text-align: center;">
                ${message}
            </div>
        `;
    }
}

// Auto-initialize
const widget = new ContactFormWidget();
widget.start().catch(err => console.error('[ContactFormWidget] Critical startup error:', err));
