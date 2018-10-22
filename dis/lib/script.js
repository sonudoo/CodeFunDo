/**
 * @param {org.dis.model.CreateInsurance} createInsuranceData
 * @transaction
 */
async function CreateInsurance(createInsuranceData){
  /**
   * This transaction adds an insurance whose insurance Id is same as transaction Id
   * The date of the insurance is same as the timestamp of transaction
   */ 

  // Check if each of the nominees actually exists

  let participantRegistry = await getParticipantRegistry('org.dis.model.Person');
  let persons = await participantRegistry.getAll();
  let personIds = [];
  for(let i in persons){
    personIds.push(persons[i].personId);
  }
  personIds.sort();
  
  let serializer = getSerializer();
  
  for(let i in createInsuranceData.insuranceNominees){
    
    let id = serializer.toJSON(createInsuranceData.insuranceNominees[i]).personId;
    let exists = false;
    let low = 0;
    let high = personIds.length - 1;
    while(low <= high){
      let mid = (low + high) >> 1;
      if(personIds[mid] == id){
        exists = true;
        break;
      }
      else if(personIds[mid] < id){
        low = mid + 1;
      }
      else{
        high = mid - 1;
      }
    }
    if(exists == false){
      throw "No such nominee "+id+" exists.";
    }
  }
  
  /**
   * If all the nominees are valid, then continue with the transaction
   */
  const factory = getFactory();
  
  let insuranceMetadata = factory.newResource('org.dis.model','InsuranceMetadata', createInsuranceData.transactionId);
  insuranceMetadata.insuranceExpiry = createInsuranceData.insuranceExpiry;
  insuranceMetadata.insuranceStatus = "0";

  let assetRegistry1 = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  await assetRegistry1.add(insuranceMetadata);
  
  let insurance = factory.newResource('org.dis.model','Insurance', createInsuranceData.transactionId);
  insurance.insuranceId = createInsuranceData.transactionId;
  insurance.insuranceDate = createInsuranceData.timestamp.toString();
  insurance.insuranceData = createInsuranceData.insuranceData;
  insurance.insuranceNominees = createInsuranceData.insuranceNominees;
  insurance.insuranceKey = createInsuranceData.insuranceKey;
  insurance.insuranceIssuer = createInsuranceData.insuranceIssuer;
  insurance.insuranceMetadata = factory.newRelationship('org.dis.model','InsuranceMetadata',createInsuranceData.transactionId);
  let assetRegistry2 = await getAssetRegistry('org.dis.model.Insurance');
  await assetRegistry2.add(insurance);
}


/**
 * @param {org.dis.model.RaiseClaim} claimInsuranceData
 * @transaction
 */
async function RaiseClaim(claimInsuranceData){
	
  let serializer = getSerializer();
  let assetRegistry1 = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistry1.get(claimInsuranceData.insuranceId);
  let assetRegistry2 = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insuranceMetadata = await assetRegistry2.get(claimInsuranceData.insuranceId);
  
  let found = false;
  for(let i in insurance.insuranceNominees){
    if(insurance.insuranceNominees[i].getIdentifier() == claimInsuranceData.claimRaiser.getIdentifier()){
      found = true;
      break;
  	}
  }
  
  if(found == false){
    throw "Failed to raise claim. The person is not a nominee of the claim";
  }
  
  if(insuranceMetadata.insuranceStatus != "0"){
    throw "The insurance is invalid. It cannot be claimed";
  }
  let assetRegistry3 = await getAssetRegistry('org.dis.model.InsuranceClaim');
  let insuranceClaims = await assetRegistry3.getAll();
  
  for(let i in insuranceClaims){
    if(insuranceClaims[i].insurance.getIdentifier() == claimInsuranceData.insuranceId && insuranceClaims[i].status != "2"){
      throw "The insurance has already been claimed by "+insuranceClaims[i].claimRaiser;
    }
  }
  const factory = getFactory();
  
  let insuranceClaim = factory.newResource('org.dis.model','InsuranceClaim', claimInsuranceData.transactionId);
  insuranceClaim.insurance = factory.newRelationship('org.dis.model','Insurance',claimInsuranceData.insuranceId);
  insuranceClaim.status = "0";
  insuranceClaim.claimRaiser = claimInsuranceData.claimRaiser;
  await assetRegistry3.add(insuranceClaim);
}

/**
 * @param {org.dis.model.AcceptClaim} claimInsuranceData
 * @transaction
 */
async function AcceptClaim(claimInsuranceData){
	
  let assetRegistry1 = await getAssetRegistry('org.dis.model.InsuranceClaim');
  let insuranceClaim = await assetRegistry1.get(claimInsuranceData.claimId);
  
  if(insuranceClaim.status != "0"){
    throw "The insurance has already been acknowledged.";
  }
  
  let assetRegistryCheck = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistryCheck.get(insuranceClaim.insurance.getIdentifier());
  
  let currentParticipant = getCurrentParticipant();
  
  if(insurance.insuranceIssuer.getIdentifier() != currentParticipant.getIdentifier()){
    throw "The claim cannot be accepted as it was not created by the given company.";
  }

  let assetRegistry3 = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insuranceMetadata = await assetRegistry3.get(insuranceClaim.insurance.getIdentifier());
  
  
  
  insuranceMetadata.insuranceStatus = "3";
  await assetRegistry3.update(insuranceMetadata);
  insuranceClaim.status = "1";
  await assetRegistry1.update(insuranceClaim);
  
}

/**
 * @param {org.dis.model.RejectClaim} claimInsuranceData
 * @transaction
 */
async function RejectClaim(claimInsuranceData){
  
  let assetRegistry1 = await getAssetRegistry('org.dis.model.InsuranceClaim');
  let insuranceClaim = await assetRegistry1.get(claimInsuranceData.claimId);
  
  let assetRegistryCheck = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistryCheck.get(insuranceClaim.insurance.getIdentifier());
  
  let currentParticipant = getCurrentParticipant();
  
  if(insurance.insuranceIssuer.getIdentifier() != currentParticipant.getIdentifier()){
    throw "The claim cannot be rejected as it was not created by the given company.";
  }
  
  if(insuranceClaim.status != "0"){
    throw "The insurance has already been acknowledged.";
  }
  
  insuranceClaim.status = "2";
  await assetRegistry1.update(insuranceClaim);
  
}


/**
 * @param {org.dis.model.InvalidateInsuranceAfterExpiration} invalidateInsuranceData
 * @transaction
 */
async function InvalidateInsuranceAfterExpiration(invalidateInsuranceData){
  
  let assetRegistryCheck = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistryCheck.get(invalidateInsuranceData.insuranceId);
  
  let currentParticipant = getCurrentParticipant();
  
  if(insurance.insuranceIssuer.getIdentifier() != currentParticipant.getIdentifier()){
    throw "The insurance cannot be invalidated as it was not created by the given company.";
  }
  
  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insuranceMetadata = await assetRegistry.get(invalidateInsuranceData.insuranceId);
  
  if(insuranceMetadata.insuranceStatus != "0"){
  	throw "The insurance is invalid/expired.";  
  }
  
  let date1 = new Date(insuranceMetadata.insuranceExpiry);
  let date2 = new Date();
  
  if(date1 > date2){
    throw "The insurance has not expired yet.";
  }
  
  insuranceMetadata.insuranceStatus = "1";
  await assetRegistry.update(insuranceMetadata);
  
}

/**
 * @param {org.dis.model.InvalidateInsuranceBeforeExpiration} invalidateInsuranceData
 * @transaction
 */
async function InvalidateInsuranceBeforeExpiration(invalidateInsuranceData){
  
  let assetRegistryCheck = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistryCheck.get(invalidateInsuranceData.insuranceId);
  
  let currentParticipant = getCurrentParticipant();
  
  if(insurance.insuranceIssuer.getIdentifier() != currentParticipant.getIdentifier()){
    throw "The insurance cannot be invalidated as it was not created by the given company.";
  }

  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insuranceMetadata = await assetRegistry.get(invalidateInsuranceData.insuranceId);
  
  if(insuranceMetadata.insuranceStatus != "0"){
  	throw "The insurance is invalid/expired.";  
  }
  
  let date1 = new Date(insuranceMetadata.insuranceExpiry);
  let date2 = new Date();
  
  if(date1 < date2){
    throw "The insurance has expired. It can no longer be invalidated.";
  }
  
  insuranceMetadata.insuranceStatus = "2";
  await assetRegistry.update(insuranceMetadata);
  
}

/**
 * @param {org.dis.model.UpdateInsuranceExpirationDate} updateInsuranceData
 * @transaction
 */
async function UpdateInsuranceExpirationDate(updateInsuranceData){
  
  let assetRegistryCheck = await getAssetRegistry('org.dis.model.Insurance');
  let insurance = await assetRegistryCheck.get(updateInsuranceData.insuranceId);
  
  let currentParticipant = getCurrentParticipant();
  
  if(insurance.insuranceIssuer.getIdentifier() != currentParticipant.getIdentifier()){
    throw "The insurance cannot be updated as it was not created by the given company.";
  }

  let assetRegistry = await getAssetRegistry('org.dis.model.InsuranceMetadata');
  let insuranceMetadata = await assetRegistry.get(updateInsuranceData.insuranceId);
  
  let date1 = new Date(insuranceMetadata.insuranceExpiry);
  let date2 = new Date(updateInsuranceData.insuranceExpiry);
  if(date2 < date1){
    throw "New Expiry date must be greater than existing expiry date";
  }
  insuranceMetadata.insuranceExpiry = updateInsuranceData.insuranceExpiry;
  await assetRegistry.update(insuranceMetadata);
  
}
