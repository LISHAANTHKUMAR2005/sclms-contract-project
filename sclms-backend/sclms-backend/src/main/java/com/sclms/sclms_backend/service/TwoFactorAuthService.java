package com.sclms.sclms_backend.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TwoFactorAuthService {

    private final GoogleAuthenticator gAuth;

    public TwoFactorAuthService() {
        this.gAuth = new GoogleAuthenticator();
    }

    /**
     * Generates a new TOTP secret and QR code URL
     */
    public Map<String, String> generateSecretAndQR(String email, String issuer) {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        String secret = key.getKey();

        // Generate QR code URL for Google Authenticator
        String qrUrl = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
            issuer, email, key
        );

        Map<String, String> result = new HashMap<>();
        result.put("secret", secret);
        result.put("qrUrl", qrUrl);

        return result;
    }

    /**
     * Validates a TOTP code against the secret
     */
    public boolean validateCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }

    /**
     * Validates a TOTP code with a time window tolerance
     */
    public boolean validateCodeWithWindow(String secret, int code, int windowSize) {
        return gAuth.authorize(secret, code, windowSize);
    }
}
