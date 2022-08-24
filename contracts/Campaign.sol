pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Campaign is ERC20 {
    uint256 minimum;
    uint256 approversCount;
    address owner;

    Request[] requests;

    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
    }
    mapping(uint256 => mapping(address => bool)) approvals;

    modifier onlyOwner() {
        require(owner == msg.sender, "Not the owner!");
        _;
    }

    constructor(uint _minimum, string memory _name, string memory _symbol, address _owner) ERC20(_name, _symbol) {
        minimum = _minimum;
        owner = _owner;
    }

    function contribute() payable public returns(bool) {
        uint256 contribution = msg.value;
        require(contribution > minimum, "contribution < minimum");

        _mint(msg.sender, contribution);
        approversCount++;
        
        return true;
    }

    function createRequest(string memory _description, uint _value, address _recipient) public onlyOwner {
        Request memory newRequest = Request({
            description: _description,
            value:_value,
            recipient: _recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);

        uint256 indexCurrentRequest = requests.length - 1;
        approvals[indexCurrentRequest];
    }

    function approveRequest(uint _index) public {
        Request storage request = requests[_index];
        
        //check that approver is a contributor
        require(balanceOf(msg.sender) > 0, "user not an contributor"); 
        
        // check that approver has not approved already
        require(!approvals[_index][msg.sender], "already approve");
        
        approvals[_index][msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint _index) public onlyOwner {
        Request storage request = requests[_index];
        
        //check that request is not already complete
        require(!request.complete, "request alreay completed");
        
        //check that approvals are at least more than 50%
        require(request.approvalCount > (approversCount / 2), "not egnough approuvers");
        
        //transfer the money to the vendor/recipient
        address payable recipient = payable(request.recipient);
        recipient.transfer(request.value);
        
        request.complete = true;
    }

    function getRequestsCount() public view returns (uint){
        return requests.length;
    }
}