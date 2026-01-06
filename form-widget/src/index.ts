import { KoruWidget, WidgetConfig } from '@redclover/koru-sdk';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import FormApp from './FormApp';

class ContactFormWidget extends KoruWidget {
    private root: Root | null = null;
    private formId: string | null = null;
    private targetWebsiteId: string | null = null;
    private apiUrl: string | null = null;

    constructor() {
        super({
            name: 'koru-contact-form',
            version: '1.0.0',
            options: {
                debug: true,
                cache: true
            }
        });
        console.log('ContactFormWidget constructor called');
    }

    private getCredentialsFromScriptTag(): { websiteId: string; apiUrl: string } | null {
        const scriptTag = document.currentScript as HTMLScriptElement ||
            document.querySelector('script[data-api-url]') ||
            document.querySelector('script[src*="koru-form"]');

        if (!scriptTag) {
            console.warn('Script tag not found or missing attributes');
            return null;
        }

        const websiteId = scriptTag.getAttribute('data-website-id');
        const apiUrl = scriptTag.getAttribute('data-api-url');

        // El websiteId es critico, apiUrl puede tener default
        if (!websiteId) {
            console.warn('Script tag missing data-website-id');
            return null;
        }

        return {
            websiteId,
            apiUrl: apiUrl || 'http://localhost:3001/api'
        };
    }

    private async fetchBackendConfig(formId: string, websiteId: string): Promise<any> {
        try {
            const API_BASE_URL = (this.apiUrl || 'http://localhost:3001/api').replace(/\/$/, '');
            const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
            const url = `${baseUrl}/forms/config/${formId}?websiteId=${websiteId}`;

            console.log('📥 Fetching widget config from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();

            if (!data.fields_config || !Array.isArray(data.fields_config)) {
                throw new Error('Configuración inválida: fields_config no encontrado o vacío.');
            }
            console.log('✅ Widget config loaded:', data);
            return data;
        } catch (error) {
            console.error('❌ Error fetching config:', error);
            throw error;
        }
    }

    async start(): Promise<void> {
        console.log('🚀 ContactFormWidget.start() called');

        // 1. Get credentials
        const credentials = this.getCredentialsFromScriptTag();
        console.log('🔑 Credentials from script tag:', credentials);

        if (credentials) {
            this.targetWebsiteId = credentials.websiteId;
            this.apiUrl = credentials.apiUrl;
        } else {
            // Fallback to authData if already available (unlikely before super.start usually)
            // But KoruSDK might have initialized it. 
            console.log('⚠️ No credentials in script tag, relying on KoruSDK authData or container attributes later.');
        }

        // 2. Call super.start() to let SDK do its auth magic
        await super.start();

        // 3. Post-auth validation
        this.formId = this.container?.getAttribute('data-form-id') || this.authData?.custom_data || null;
        // Re-check websiteId from container if not in script
        if (!this.targetWebsiteId) {
            this.targetWebsiteId = this.container?.getAttribute('data-website-id') || (this.authData as any)?.website?.id || null;
        }

        if (!this.formId || !this.targetWebsiteId) {
            this.showError('Error: Faltan formId o websiteId para iniciar.');
            return;
        }

        // 4. Fetch Config from OUR Backend (Database)
        try {
            console.log('Calling fetchBackendConfig...');
            const config = await this.fetchBackendConfig(this.formId, this.targetWebsiteId);

            console.log('Calling onInit with config...');
            await this.onInit(config);

            console.log('Calling onRender with config...');
            await this.onRender(config);

        } catch (error: any) {
            this.showError(`Error al iniciar widget: ${error.message}`);
        }
    }

    async onInit(config: any) {
        console.log('📝 onInit called with config', config);
        // Here we could process the config if needed before render
        // For now, we just pass it along
    }

    async onRender(config: any) { // Receives the config fetched in start()
        console.log('🎨 onRender called');

        if (!this.container) return;

        this.root = createRoot(this.container);
        this.root.render(
            React.createElement(React.StrictMode, null,
                React.createElement(FormApp, {
                    formId: this.formId || '',
                    websiteId: this.targetWebsiteId,
                    apiUrl: this.apiUrl || undefined,
                    initialConfig: config // The config from DB
                })
            )
        );
    }

    onConfigUpdate() {
        console.log('ContactFormWidget: Config updated');
    }

    onDestroy() {
        if (this.root) {
            this.root.unmount();
        }
        this.root = null;
    }

    private showError(message: string) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="
                    padding: 20px;
                    color: #dc2626;
                    text-align: center;
                    font-family: sans-serif;
                    background-color: #fee2e2;
                    border-radius: 8px;
                    border: 1px solid #fca5a5;
                ">
                    <strong>Error del Widget:</strong> ${message}
                </div>
            `;
        }
    }
}

export default ContactFormWidget;

// Inicialización automática
const widget = new ContactFormWidget();
widget.start().catch(err => {
    console.error('Koru Widget Boot Error:', err);
});
