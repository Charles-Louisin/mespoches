package com.mespoches.app;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** Niveau 1 — filtre rapide sans IA (package + mots-clés). */
public final class MoneyTextFilter {
    private MoneyTextFilter() {}

    private static final String[] KEYWORDS = {
        "fcfa", "xaf", "cfa", "€", "eur", "euro", "usd", "$", "dollar", "franc",
        "montant", "amount", "solde", "balance", "compte", "account",
        "paiement", "payment", "payé", "paye", "paid", "payez",
        "transfert", "transfer", "virement", "envoyé", "envoye", "sent", "received", "reçu", "recu",
        "retrait", "withdrawal", "withdraw", "dépôt", "depot", "deposit",
        "débit", "debit", "crédit", "credit", "debited", "credited",
        "transaction", "opération", "operation", "achat", "purchase", "facture", "invoice",
        "receipt", "ticket", "carte", "card", "bank", "banque",
        "prélèvement", "prelevement", "mobile money", "momo", "wallet", "portefeuille",
        "cash", "argent", "money", "fee", "frais", "commission", "taxe",
        "reussi", "success", "successful", "confirmé", "confirme", "confirmed",
        "orange money", "orangemoney", "mtn", "express union", "uba", "ecobank",
        "afriland", "scb", "bicec", "wave"
    };

    /** Apps portefeuille / banque uniquement — pas de messagerie (WhatsApp, etc.). */
    private static final Set<String> MONEY_PACKAGES = new HashSet<>(Arrays.asList(
        "com.orange.money",
        "com.orange.omcm",
        "com.mtn.momo",
        "com.mtn.momocm",
        "com.wave.personal",
        "com.ecobank.mobile",
        "com.ubagroup.uba"
    ));

    public static boolean isMoneyPackage(String packageName) {
        if (packageName == null || packageName.isEmpty()) return false;
        String p = packageName.toLowerCase(Locale.ROOT);
        for (String known : MONEY_PACKAGES) {
            if (p.equals(known) || p.startsWith(known)) return true;
        }
        return p.contains("momo") || p.contains("orangemoney") || p.endsWith(".wallet");
    }

    public static boolean isMoneyRelated(String raw) {
        return isMoneyRelated(raw, null);
    }

    public static boolean isMoneyRelated(String raw, String packageName) {
        // Package MM connu → accepter ; sinon exiger signal monétaire dans le texte
        if (isMoneyPackage(packageName)) return true;
        return hasMoneySignal(raw);
    }

    private static boolean hasMoneySignal(String raw) {
        if (raw == null) return false;
        String text = raw.trim();
        if (text.length() < 4) return false;

        String lower = text.toLowerCase(Locale.ROOT);

        for (String keyword : KEYWORDS) {
            if (lower.contains(keyword)) {
                return true;
            }
        }

        Pattern currencyAmount = Pattern.compile(
            "(?i)(\\d{1,3}([\\s.,]\\d{3})+|\\d+)([\\s.,]\\d{1,2})?\\s*(fcfa|xaf|cfa|€|eur|euro|euros|\\$|usd|dollar|dollars|£|gbp|francs?|f\\s*cfa)"
        );
        return currencyAmount.matcher(lower).find();
    }
}
