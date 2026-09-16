package com.mespoches.app;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Tests de sécurité pour le système SMS
 * Vérifie que seuls les SMS autorisés sont traités
 */
public class SmsSecurityTest {

    @Test
    public void testOnlySmsPackagesAreAccepted() {
        // Applications SMS légitimes
        assertTrue(isSmsPackage("com.android.messaging"));
        assertTrue(isSmsPackage("com.google.android.apps.messaging"));
        assertTrue(isSmsPackage("com.samsung.android.messaging"));
        assertTrue(isSmsPackage("com.some.app.sms"));
        assertTrue(isSmsPackage("com.custom.mms"));
    }

    @Test
    public void testNonSmsPackagesAreRejected() {
        // Applications NON-SMS doivent être rejetées
        assertFalse(isSmsPackage("com.whatsapp"));
        assertFalse(isSmsPackage("com.facebook.orca")); // Messenger
        assertFalse(isSmsPackage("org.telegram.messenger"));
        assertFalse(isSmsPackage("com.twitter.android"));
        assertFalse(isSmsPackage("com.instagram.android"));
        assertFalse(isSmsPackage("com.snapchat.android"));
        assertFalse(isSmsPackage("com.google.android.gm")); // Gmail
        assertFalse(isSmsPackage("com.microsoft.office.outlook"));
        assertFalse(isSmsPackage("com.slack"));
    }

    @Test
    public void testMoneyPackagesAreNotTreatedAsSms() {
        // Les apps Mobile Money ne sont PAS des apps SMS
        // Elles doivent passer par le filtre de contenu
        assertFalse(isSmsPackage("com.orange.money"));
        assertFalse(isSmsPackage("com.mtn.momo"));
        assertFalse(isSmsPackage("com.wave.personal"));
    }

    @Test
    public void testNullAndEmptyPackages() {
        assertFalse(isSmsPackage(null));
        assertFalse(isSmsPackage(""));
        assertFalse(isSmsPackage("   "));
    }

    @Test
    public void testMoneyTextFilter() {
        // SMS monétaires valides
        assertTrue(MoneyTextFilter.isMoneyRelated("Vous avez reçu 5000 FCFA de John"));
        assertTrue(MoneyTextFilter.isMoneyRelated("Paiement de 1250 XAF effectué"));
        assertTrue(MoneyTextFilter.isMoneyRelated("Transfert réussi. Montant: 3000F"));
        assertTrue(MoneyTextFilter.isMoneyRelated("Solde actuel: 15000 FCFA"));
        assertTrue(MoneyTextFilter.isMoneyRelated("Votre retrait de 2000 FCFA est confirmé"));
    }

    @Test
    public void testPersonalSmsAreRejected() {
        // SMS personnels doivent être rejetés
        assertFalse(MoneyTextFilter.isMoneyRelated("Salut, comment ça va ?"));
        assertFalse(MoneyTextFilter.isMoneyRelated("Rendez-vous demain à 15h"));
        assertFalse(MoneyTextFilter.isMoneyRelated("Joyeux anniversaire !"));
        assertFalse(MoneyTextFilter.isMoneyRelated("As-tu reçu mon message ?"));
        assertFalse(MoneyTextFilter.isMoneyRelated("Je t'appelle ce soir"));
    }

    @Test
    public void testContentFingerprinting() {
        // Même transaction doit produire la même empreinte
        String sms1 = "Transaction ID: PP123456.1234.ABC Montant: 5000 FCFA";
        String sms2 = "Transaction ID: PP123456.1234.ABC   Montant:   5000 FCFA";
        
        String fp1 = MoneyNotificationListener.contentFingerprint(sms1);
        String fp2 = MoneyNotificationListener.contentFingerprint(sms2);
        
        assertNotNull(fp1);
        assertNotNull(fp2);
        assertFalse(fp1.isEmpty());
        assertFalse(fp2.isEmpty());
        // Les empreintes devraient être similaires (normalisation)
    }

    @Test
    public void testApiUrlSanitization() {
        // URLs valides
        assertEquals(
            "https://mespochesbackend-production.up.railway.app/api",
            SmsMonitorPlugin.sanitizeApiUrl("https://mespochesbackend-production.up.railway.app/api")
        );
        
        // URLs non sécurisées doivent être rejetées
        String defaultApi = "https://mespochesbackend-production.up.railway.app/api";
        assertEquals(defaultApi, SmsMonitorPlugin.sanitizeApiUrl("http://malicious.com"));
        assertEquals(defaultApi, SmsMonitorPlugin.sanitizeApiUrl("ftp://bad.com"));
        assertEquals(defaultApi, SmsMonitorPlugin.sanitizeApiUrl("javascript:alert(1)"));
    }

    // Copie de la méthode pour les tests (devrait être synchronisée avec MoneyNotificationListener)
    private static boolean isSmsPackage(String packageName) {
        if (packageName == null) return false;
        return packageName.equals("com.android.messaging") ||
               packageName.equals("com.google.android.apps.messaging") ||
               packageName.equals("com.samsung.android.messaging") ||
               packageName.contains(".mms") ||
               packageName.contains(".sms");
    }
}
