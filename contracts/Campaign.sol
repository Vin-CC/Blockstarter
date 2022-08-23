pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Campaign is ERC20 {
    uint256 minimum;

    constructor(uint _minimum, string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        minimum = _minimum;
    }

    function contribute() payable public returns(bool) {
        uint256 contribution = msg.value;
        require(contribution > minimum, "contribution < minimum");

        _mint(msg.sender, contribution);
        
        return true;
    }
}