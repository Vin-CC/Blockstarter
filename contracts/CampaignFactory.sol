pragma solidity ^0.8.0;

import "./Campaign.sol";

contract CampaignFactory {
    address[] private campaigns;

    function createCampaign(uint _minimum, string memory _name, string memory _symbol) public returns(bool) {
        address newCampaign = address(new Campaign(_minimum, _name, _symbol, msg.sender));
        campaigns.push(newCampaign);

        return true;
    }

    function getDeployedCampaigns() public view returns(address[] memory) {
        return campaigns;
    }
}