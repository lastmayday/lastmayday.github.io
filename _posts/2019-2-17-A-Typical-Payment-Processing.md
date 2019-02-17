---
layout: default
title: A Typical Online Payment Processing
---

* toc
{:toc #toc}

<br />

## Intro

This article is an introduction to a typical payment processing by using a third-party payment platform.

It is a simple introduction article and will be no specific technical details.

It is my personal understanding, and it may not be very accurate.
Please help me correct errors in this article, thank you!

Here is an image showing the payment actions:

<img src="http://qiniu.lastmayday.com/payment-processing.jpg" style="width:800px;" />

<br />

## Acquiring

Imaging that you have paid for a commodity online using a third-party payment platform.

Let's assume that this third-party payment platform is called "GGPay."  

How is the money transferred from your account to the merchant's account? And what roles does the GGPay play in this payment?

<br />

Let's look at the image above. When you click the "checkout" button, GGPay received your payment request; it creates an order for this payment request.

The order contains some information about this payment, such as the commodity's name, the merchant's information, the total amount, etc.

This stage is called "Acquiring" for GGPay.

<br />

## Checkout

Then, after GGPay receives the order information, it should display a payment view to you; and you can see the total amount you should pay and choose a payment method.

We're talking now is an online payment, not an auto debit.

If you are shopping at a supermarket, then when you go to the checkout counter to pay these commodities, the cashier will tell you how much you should pay, and you can use cash or cards or other payment methods to pay.

The online payment view is like the checkout counter; it displays the total amount, the transaction fees, and the payment methods that you can choose one to finish the payment.

After you make sure the payment information is correct, you submit the payment by press the "submit" button.

Then GGPay receives your submission, and it starts to do the real payment transaction.

<br />

## Payment

When GGPay receives your submission, it gets the information about the total amount and the payment channel you choose.

The payment channels can be two different situations. One is the balance in your GGPay account; one is other payment channels like credit cards.

Let's look at balance first.

Because the balance is in your GGPay amount, it means that GGPay can transfer the money to the merchant's account directly.

However, the money is usually not immediately transferred to the merchant; it will be transferred in one or two days after the transaction finishes. It's called T+n settlement.

If you pay with credit cards, like Visa or MasterCard, GGPay will firstly request money from your issuing bank.

When GGPay gets the money from the issuing bank, it saves the money to your balance account or GGPay's transition account.

If you have the balance account, the money will stay in your balance amount, or it will stay in GGPay's transition account.

If the money stays in your balance amount, it will be frozen, so you can't use it directly.
Next processing is like paying with balance.

The main difference between balance with credit cards is that balance doesn't need to communicate with other institutions for requesting money.

Now, let's look deep into the details of GGPay's internal processing.

<img src="http://qiniu.lastmayday.com/payment-ggpay-inner.jpg" style="width:680px;" />

<br />

When GGPay's payment system receives the request, it starts to prepare for payment.

It saves the payment order, checks if it is necessary to communicate with other institutions for requesting money.

If necessary, it interacts with the external agencies and gets the money. The money now is in the transition account, which means that the money won't stay in this account for a long time.

Then it records the transaction to keep the accounts.
When the payment system receives the message that GGPay has got the money, the preparation stage is done.

Then the payment system starts to finish the payment.

It transfers the money from the transition account to the guaranteed account. It also records the transaction to keep the accounts.

Then it updates the payment order to succeed.

Now you will see your payment is successful.

<br />

## Success

Now you can get the commodity that you just paid, but for the merchant, he doesn't get the money in his account yet.

According to the agreement between GGPay and merchants, he will get the money in one or two days after the transaction finishes.

<br />
