package com.myfin.loanservice.service;

import org.springframework.stereotype.Service;

@Service
public class AutoReplyService {

    // ✅ Generate auto reply based on user message
    public String generateReply(String message) {
        if (message == null || message.trim().isEmpty()) {
            return getDefaultReply();
        }

        String msg = message.toLowerCase().trim();

        // ── BALANCE ──
        if (msg.contains("balance") ||
            msg.contains("how much money") ||
            msg.contains("account balance")) {
            return "💰 To check your account balance, " +
                   "please visit your **Dashboard**. " +
                   "Your current balance is displayed " +
                   "on the top of the dashboard page.";
        }

        // ── LOAN ──
        if (msg.contains("loan status") ||
            msg.contains("my loan") ||
            msg.contains("loan approved") ||
            msg.contains("loan denied")) {
            return "🏦 To check your loan status, " +
                   "go to **My Loans** page from the sidebar. " +
                   "You can see all your loan applications " +
                   "and their current status (PENDING / " +
                   "APPROVED / DENIED) there.";
        }

        if (msg.contains("apply loan") ||
            msg.contains("need loan") ||
            msg.contains("want loan") ||
            msg.contains("loan apply")) {
            return "📋 To apply for a loan, click on " +
                   "**Apply for Loan** in the sidebar. " +
                   "We offer Home Loan (8.5%), " +
                   "Personal Loan (12%), " +
                   "Car Loan (10.5%), and " +
                   "Education Loan (9%). " +
                   "Your application will be reviewed " +
                   "within 24 hours.";
        }

        // ── TRANSFER ──
        if (msg.contains("transfer") ||
            msg.contains("send money") ||
            msg.contains("send funds")) {
            return "🔄 To transfer money:\n" +
                   "1. Go to **Transfer** page\n" +
                   "2. Click on Transfer tab\n" +
                   "3. Enter recipient's MYFIN account number\n" +
                   "4. Enter amount\n" +
                   "5. Enter your 4-digit PIN\n" +
                   "6. Click Transfer Funds\n\n" +
                   "Make sure you have set your transaction PIN!";
        }

        // ── PIN ──
        if (msg.contains("pin") ||
            msg.contains("forgot pin") ||
            msg.contains("reset pin") ||
            msg.contains("change pin")) {
            return "🔑 For PIN related help:\n" +
                   "• **Set PIN**: Go to Transfer page → Set PIN Now\n" +
                   "• **Change PIN**: Go to Profile → Change PIN\n" +
                   "• **Forgot PIN**: Contact admin to reset your PIN\n\n" +
                   "⚠️ Never share your PIN with anyone!";
        }

        // ── DEPOSIT ──
        if (msg.contains("deposit") ||
            msg.contains("add money") ||
            msg.contains("credit")) {
            return "📥 To deposit money:\n" +
                   "1. Go to **Transfer** page\n" +
                   "2. Click **Deposit** tab\n" +
                   "3. Enter amount\n" +
                   "4. Enter your 4-digit PIN\n" +
                   "5. Click Deposit\n\n" +
                   "Deposit reflects instantly in your account!";
        }

        // ── WITHDRAW ──
        if (msg.contains("withdraw") ||
            msg.contains("take money") ||
            msg.contains("debit")) {
            return "📤 To withdraw money:\n" +
                   "1. Go to **Transfer** page\n" +
                   "2. Click **Withdraw** tab\n" +
                   "3. Enter amount\n" +
                   "4. Enter your 4-digit PIN\n" +
                   "5. Click Withdraw\n\n" +
                   "Make sure you have sufficient balance!";
        }

        // ── EMI ──
        if (msg.contains("emi") ||
            msg.contains("monthly payment") ||
            msg.contains("installment")) {
            return "🧮 To calculate your EMI:\n" +
                   "1. Go to **EMI Calculator** in sidebar\n" +
                   "2. Enter loan amount\n" +
                   "3. Enter interest rate\n" +
                   "4. Enter tenure (months)\n" +
                   "5. See your monthly EMI instantly!\n\n" +
                   "Formula: EMI = P × R × (1+R)^N / ((1+R)^N - 1)";
        }

        // ── INVESTMENT ──
        if (msg.contains("invest") ||
            msg.contains("fd") ||
            msg.contains("fixed deposit") ||
            msg.contains("rd") ||
            msg.contains("mutual fund")) {
            return "📈 Investment options available:\n" +
                   "• **Fixed Deposit (FD)** - Safe, fixed returns\n" +
                   "• **Recurring Deposit (RD)** - Monthly savings\n" +
                   "• **Mutual Fund** - Market linked returns\n\n" +
                   "Go to **Investments** page to start investing!";
        }

        // ── ACCOUNT ──
        if (msg.contains("account number") ||
            msg.contains("my account") ||
            msg.contains("account details")) {
            return "🏧 Your account details are available on:\n" +
                   "• **Dashboard** - Shows account number & balance\n" +
                   "• **Profile** - Shows full account information\n\n" +
                   "Your account number starts with MYFIN.";
        }

        // ── INTEREST RATES ──
        if (msg.contains("interest") ||
            msg.contains("rate") ||
            msg.contains("interest rate")) {
            return "📊 Current Interest Rates at MyFin Bank:\n" +
                   "• Home Loan: 8.5% per annum\n" +
                   "• Personal Loan: 12% per annum\n" +
                   "• Car Loan: 10.5% per annum\n" +
                   "• Education Loan: 9% per annum\n" +
                   "• Fixed Deposit: 7% per annum\n" +
                   "• Recurring Deposit: 6.5% per annum";
        }

        // ── BLOCK ACCOUNT ──
        if (msg.contains("block") ||
            msg.contains("freeze") ||
            msg.contains("suspend")) {
            return "🚫 To block or freeze your account, " +
                   "please contact our admin team directly. " +
                   "This action requires admin intervention " +
                   "for your security.\n\n" +
                   "📞 Our customer service will " +
                   "contact you soon!";
        }

        // ── FRAUD ──
        if (msg.contains("fraud") ||
            msg.contains("scam") ||
            msg.contains("unauthorized") ||
            msg.contains("stolen")) {
            return "🚨 **URGENT - Fraud Alert!**\n" +
                   "If you suspect fraud on your account:\n" +
                   "1. Do NOT share your PIN with anyone\n" +
                   "2. Change your PIN immediately\n" +
                   "3. Our security team has been notified\n\n" +
                   "📞 Our customer service will " +
                   "contact you within 1 hour!";
        }

        // ── HELP ──
        if (msg.contains("help") ||
            msg.contains("hi") ||
            msg.contains("hello") ||
            msg.contains("hey") ||
            msg.contains("helo")) {
            return "👋 Hello! Welcome to MyFin Bank Support!\n\n" +
                   "I can help you with:\n" +
                   "• 💰 Account Balance\n" +
                   "• 🔄 Money Transfer\n" +
                   "• 📥 Deposit & Withdraw\n" +
                   "• 🏦 Loan Application & Status\n" +
                   "• 🧮 EMI Calculator\n" +
                   "• 📈 Investments\n" +
                   "• 🔑 PIN Help\n" +
                   "• 📊 Interest Rates\n\n" +
                   "Just type your question and I will help!";
        }

        // ── THANK YOU ──
        if (msg.contains("thank") ||
            msg.contains("thanks") ||
            msg.contains("ok") ||
            msg.contains("okay") ||
            msg.contains("got it")) {
            return "😊 You're welcome! " +
                   "Is there anything else I can help you with?\n\n" +
                   "Have a great day! 🌟";
        }

        // ── DEFAULT ──
        return getDefaultReply();
    }

    private String getDefaultReply() {
        return "🙏 Thank you for contacting MyFin Bank Support!\n\n" +
               "Your query has been received. " +
               "Our customer service team will " +
               "contact you soon.\n\n" +
               "⏰ Expected response time: " +
               "Within 24 business hours\n\n" +
               "For urgent help type **help** " +
               "to see available self-service options.";
    }
}
