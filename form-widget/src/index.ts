import { KoruWidget, WidgetConfig } from '@redclover/koru-sdk';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import FormApp from './FormApp';

class KoruWidgetForm extends KoruWidget {
    private root: Root | null = null;
    private formId: string | null = null;
    private targetWebsiteId: string | null = null;

    constructor() {
        super({
            name: 'koru-contact-form',
            version: '1.0.0',
            options: {
                debug: true,
                cache: true
            }
        });
    }

    async onInit(config: WidgetConfig) {
        // El SDK ya autenticó el website_id contra Koru Suite antes de llegar aquí.
        // Si la validación falla, onInit NUNCA se ejecuta.

        this.formId = this.container?.getAttribute('data-form-id') || null;
        this.targetWebsiteId = this.container?.getAttribute('data-website-id') || null;

        console.log('KoruFormWidget: Authorized for Website:', this.targetWebsiteId);

        if (!this.formId) {
            this.log('Error: No formId found');
            return;
        }

        // Aquí podríamos pedir configuración extra a NUESTRO backend si fuera necesario,
        // usando el token de autorización que el SDK maneja internamente.
        // this.authData contiene la respuesta de Koru Suite.
    }

    onRender() {
        if (!this.formId || !this.authData?.authorized) {
            if (this.container) {
                this.container.innerHTML = '<div style="color: red; padding: 10px;">Acceso denegado o Configuración Inválida</div>';
            }
            return;
        }

        if (this.container) {
            this.root = createRoot(this.container);
            this.renderReact();
        }
    }

    onConfigUpdate() {
        console.log('KoruFormWidget: Config updated');
        this.renderReact();
    }

    private renderReact() {
        if (this.root && this.formId) {
            this.root.render(
                React.createElement(React.StrictMode, null,
                    React.createElement(FormApp, {
                        formId: this.formId,
                        websiteId: this.targetWebsiteId
                    })
                )
            );
        }
    }

    onDestroy() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

export default KoruWidgetForm;

// Inicialización automática
const widget = new KoruWidgetForm();
widget.start().catch(err => {
    console.error('Koru Widget Error:', err);
});

