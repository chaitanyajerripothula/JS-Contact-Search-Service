// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

export default class {
    constructor(updates, service) {

        this.contacts = [];
        this.contactsService = service;

        // add: indicates a contact has been added to the system and provides the ID of the new contact.
        updates.on('add', this.addContact);
        
        // remove: indicates a contact has been removed from the system and provides the ID of the removed contact.
        updates.on('remove', this.removeContact);

        // change: indicates a contact's info has been updated and provides the ID, field, and value of the changed contact.
        updates.on('change', this.changeContact);

    }
    
    /*
        @Input(id: string)
    */
    addContact = (id) => {
        this.contactsService.getById(id).then(contact => {this.contacts.push(contact)});
    }

    /*
        @Input(id: string)
    */
    removeContact = (id) => {
        this.contacts = this.contacts.filter((_contact) => _contact.id !== id)
    }

    /*
        @Input(id: string, fieldToUpdate: string , valToUpdate: string)
    */
    changeContact = (id, fieldToUpdate, valToUpdate) => {
        let contact = this.contacts.find((_contact) => _contact.id == id);
        contact[fieldToUpdate] = valToUpdate;
    }

    /*
        @Input(query: string)
        @output(formattedContacts: array)
    */
    search(query) {
        let searchResult = []
        
        this.contacts.forEach(contact => {
          if (this.searchNames(contact.firstName, contact.nickName, contact.lastName, query)
            || this.searchPhoneNumber(contact.primaryPhoneNumber, contact.secondaryPhoneNumber, query)
            || this.searchEmail(contact.primaryEmail, contact.secondaryEmail, query)) {
            searchResult.push(contact);
          }
        });
        
        return this.dataFormatter(searchResult);
    }

    /*
        Search By Email
        @Input(primaryEmail: string, secondaryEmail: string, searchQuery: string)
        @Output(boolean)
    */
    searchEmail(primary, secondary, query) {
        
        let emails =  [primary, secondary].filter((element) => { return element.includes(query) })
        return emails.length > 0;
    }

    /*
        Search By Phone
        @Input(primaryPhoneNumber: string, secondaryPhoneNumber: string, searchQuery: string)
        @Output(boolean)
    */
    searchPhoneNumber(primaryPhoneNumber, secondaryPhoneNumber, query) {
        var phones = [primaryPhoneNumber, secondaryPhoneNumber]
            .concat(this.phoneSanitize(primaryPhoneNumber), this.phoneSanitize(secondaryPhoneNumber))
            .concat(this.formatPhones({primaryPhoneNumber, secondaryPhoneNumber}))
            .filter((phoneno) => { return phoneno.includes(query) })
        
        return phones.length > 0;
    }

    /*
        Search By Email
        @Input(firstName: string, nickName: string, lastName: string, searchQuery: string)
        @Output(found: boolean)
    */
    searchNames(firstName, nickName, lastName, query) {
        let found = false;

        query.split(' ').forEach(element => {
            
            if (firstName.includes(element) 
                || lastName.includes(element) 
                || (nickName !== '' && nickName.includes(element))) { 
                    found = true; return; 
            }
        });
        return found;
    }

    dataFormatter = (contacts) =>{
        var formattedContacts = [];

        var formatContact = (_contact) => {
            
            return {
                      id : _contact.id
                    , name : this.nameFormatter(_contact)
                    , email : this.emailFormatter(_contact)
                    , phones : this.formatPhones(_contact)
                    , address : this.addressFormatter(_contact)
                    };
        };

        contacts.forEach(contact => {
            var formattedContact = formatContact(contact);
            formattedContacts.unshift(formattedContact);
        });

        return formattedContacts;
    }

    // nameFormatter - Formatting name for final output
    nameFormatter({firstName, nickName, lastName}) {

        // The name string is formatted from the first name (or nick name if it exists) and last name
        return ((nickName !== '') &&  [nickName, lastName].join(' ')) 
                                  || [firstName, lastName].join(' ');
    }

    emailFormatter = ({primaryEmail, secondaryEmail}) => {
        return primaryEmail || secondaryEmail;
    }

    // emailFormatter - Formatting email for final output
    formatPhones({primaryPhoneNumber, secondaryPhoneNumber}) {
        var phones = [];
        
        [primaryPhoneNumber, secondaryPhoneNumber].forEach(phone => {
            
            if (phone !== '' && phone !== null) {
                phone = this.phoneSanitize(phone);
                
                // Phone numbers should be formatted as (xxx) xxx-xxxx
                (phone.length === 10)  &&
                    phones.push("(" + phone.substring(0, 3) + ") " 
                                    + phone.substring(3, 6) + "-" 
                                    + phone.substring(6, 10) );
            }
        });

        return phones;
    }

    phoneSanitize = (phoneno) => {
        return phoneno?.replace(/-/g, '').replace(/\+1/g, '');
    }

    // emailFormatter - Formatting email for final output
    addressFormatter({addressLine1, addressLine2, addressLine3, city, state, zipCode}) {
        var contactAddress = '';

        [addressLine1, addressLine2, addressLine3, city, state, zipCode].forEach(_contactAddress => {
            if(_contactAddress) {
                if (_contactAddress.length > 0) {
                    contactAddress = contactAddress + " " + _contactAddress;
                } else {
                    contactAddress = contactAddress + _contactAddress;
                } 
            }
        });

        return contactAddress;
    }
}
