import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmbedCodeService {
    constructor(private jwtService: JwtService) { }

    /**
     * Generates a secure embed code for the client website.
     * The JWT contains the client_id and website_url to prevent hijacking.
     */
    generateEmbedCode(formId: string, websiteUrl: string, clientId: string) {
        const payload = {
            formId,
            websiteUrl,
            clientId,
            iat: Math.floor(Date.now() / 1000),
        };

        const token = this.jwtService.sign(payload);

        return `
<!-- Koru Contact Form Widget -->
<div id="koru-contact-form" 
     data-form-id="${formId}" 
     data-website-id="${clientId}" 
     data-token="${token}">
</div>
<script 
  src="https://cdn.korusuite.com/widgets/contact-form.js" 
  defer>
</script>
<!-- End Koru Contact Form Widget -->
    `.trim();
    }
}
