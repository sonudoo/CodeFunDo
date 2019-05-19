# CodeFunDo

This project is a submission for CodeFunDo, a hackathon organized by Microsoft Corporation. The problem statement was to come up with solutions to predict/mitigate the occurence of a natural disaster. Please use the PDF file 'Idea.pdf' to get a detailed insight.

## Disclaimer

We do not hold any copyright of this idea. We want this to be an open source solution. We are open to suggestions and improvements.

Predicting a natural disaster is virtually impossible. There are at least a million factors that can have an effect. The meteorological department uses the most advanced technologies and still fail to predict; this is pretty good hint that predicting a natural disaster is indeed difficult. Here we are trying to solve a problem related to management of a disaster.

## Problem Statement

Huge economic losses are faced by people when they fail to claim for insurance after natural disaster due to loss of identity or documents related to same. Our solution is to build a blockchain based solution for insurance related to protection against natural disasters so that in case of any kind of loss of identity, the insurance can be easily claimed back.


## Current Scenario

- Insurance companies face huge losses every year due to fake claims on property destruction.
- People face a lot of problem in claiming their insurance due to loss of documents. Moreover, they have lost their identity which worsens the situation.


## Statistics 

_Source:_

[https://www.statista.com/topics/1075/insured-catastrophe-losses/](https://www.statista.com/topics/1075/insured-catastrophe-losses/)

[https://www.iii.org/fact-statistic/facts-statistics-global-catastrophes](https://www.iii.org/fact-statistic/facts-statistics-global-catastrophes)

[https://timesofindia.indiatimes.com/business/india-business/1-in-10-insurance-claims-turns-out-to-be-a-fraud/articleshow/50034905.cms](https://timesofindia.indiatimes.com/business/india-business/1-in-10-insurance-claims-turns-out-to-be-a-fraud/articleshow/50034905.cms)

[https://indiaforensic.com/certifications/india-loses-6-25-billion-to-insurance-frauds-an-indiaforensic-research/](https://indiaforensic.com/certifications/india-loses-6-25-billion-to-insurance-frauds-an-indiaforensic-research/)

- The insurance industry faces a loss of $138.06 billion by natural disasters from 1995-2017.
- Hurricane Katrina (2005) was the most expensive catastrophe for insurance industry globally.
- 1 out of every 10 insurance claims in India is reported to be fake.
- Every year, India loses $6.25 billion to insurance frauds.


## Detailed Solution

While Ethereum is a default choice of several blockchain implementation, we are going to use Hyperledger. The reasons for using Hyperledger are as stated below: -

- Hyperledger is a permissioned blockchain network. There are limited number of participants who can see every block. On the other hand, Ethereum is public - every block is visible to everyone; every insurance would be visible to everyone.
- Hyperledger is a open source solution by Linux foundation. It is highly modular and each of its parts can be easily integrated to build a complete solution.

### The Participants of the Network

**Person**                                                               
**Insurance Company**

- Each person gets a unique identity on the network (say a username) and a password by which can decrypt all their insurance documents.
- Each insurance company can create new insurance agreement documents and encrypt them with user&#39;s password. These documents are stored on blockchain to maintain confidentiality.

### The Assets of the Network

**Insurance Document**

The insurance documents are created by the insurance companies and encrypted with user&#39;s passwords. These documents are then stored on blockchain ensuring confidentiality and integrity.

### New Scenario

- The insurance documents are now on blockchain network.
- People can login to their accounts to access their insurance documents and use these documents to put forward their claims.
- The insurance companies can check the authenticity of the claim using the blockchain network.


## Tools and Technologies

**Microsoft Platform** - Hyperledger blockchain network on Microsoft Azure &amp; GitHub

**IDE** - Microsoft Visual Studio Code

**Documentation and Wireframing tools** - Microsoft Word and Balsamiq

**Languages and Technologies -** HTML, CSS, BootStrap, JS (Frontend), NodeJS (Backend API), Go Lang (Blockchain).
