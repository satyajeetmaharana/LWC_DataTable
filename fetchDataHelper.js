const recordMetadata = {
    id: 'id',
    creditorName: 'creditorName',
    firstName: 'firstName',
    lastName: 'lastName',
    minPaymentPercentage: 'minPaymentPercentage',
    balance: 'balance',
};

export default function fetchDataHelper({ amountOfRecords }) {
    return fetch('https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json')
    .then(response => response.json());
}
