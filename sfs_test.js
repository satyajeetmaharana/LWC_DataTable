import { LightningElement, track, api} from 'lwc';
import fetchDataHelper from './fetchDataHelper';

const columns = [
    { label: 'id', fieldName: 'name' },
    { label: 'Creditor', fieldName: 'creditorName'},
    { label: 'First Name', fieldName: 'firstName'},
    { label: 'Last Name', fieldName: 'lastName'},
    { label: 'Minimum Pay', fieldName: 'minPaymentPercentage'},
    { label: 'Balance', fieldName: 'balance', type: 'currency' },
];

export default class BasicDatatable extends LightningElement {
    data = [];
    columns = columns;
    totalSelectedBalance = 0;
    totalRowCount = 0;
    totalCheckedCount = 0;
    toggleIconName = 'utility:preview';
    newRows = [];
    newIdGenerator = 0;
    isSaveDisabled = true;
    // eslint-disable-next-line @lwc/lwc/no-async-await
    async connectedCallback() {
        const jsondata = await fetchDataHelper({ amountOfRecords: 100 });
        var finalJsonData = [];
        for(var i = 0; i < jsondata.length; i++){
            var rowData = jsondata[i];
            rowData['isChecked'] = false;
            rowData['highlighted'] = "nonHighlightedRow";
            finalJsonData.push(rowData);
            this.totalRowCount += 1;
            if(rowData['id'] > this.newIdGenerator){
                this.newIdGenerator = rowData['id'];
            }
        }
        this.data = finalJsonData;
        
    }
    handleCheckBoxClick(event) {
        var indexOfRow = this.findRowIndexById(event.target.name);
        var rowData = {};
        if(indexOfRow == -1){
            indexOfRow = this.findNewRowIndexById(event.target.name);
            rowData = this.newRows[indexOfRow];
        }else{
            rowData = this.data[indexOfRow];
        }
        
        /*
        if(event.target.checked == true){
            this.totalSelectedBalance += rowData['balance'];
            this.totalCheckedCount += 1;
        }else{
            this.totalSelectedBalance -= rowData['balance'];
            this.totalCheckedCount -= 1;
        }*/
        this.recalculateCosts();
        this.highlightRows();
    }
    highlightRows(){
        let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]');
        var filteredData = [];
        var newFilteredData = [];
        var selectedRows = new Set()
        for(var checkboxIndex=0; checkboxIndex<checkboxes.length; checkboxIndex++) {
            if(checkboxes[checkboxIndex].checked == true){
                selectedRows.add(checkboxes[checkboxIndex].name);
            }
        }
        for(var dataIndex=0; dataIndex < this.data.length; dataIndex++){
            var rowData = this.data[dataIndex];
            if(selectedRows.has(rowData['id']) == true){
                rowData['highlighted'] = "highlightedRow";
            }else{
                rowData['highlighted'] = "nonHighlightedRow";
                
            }
            filteredData.push(rowData);
        }
        for(var dataIndex=0; dataIndex < this.newRows.length; dataIndex++){
            var rowData = this.newRows[dataIndex];
            if(selectedRows.has(rowData['id']) == true){
                rowData['highlighted'] = "highlightedRow";
            }else{
                rowData['highlighted'] = "nonHighlightedRow";
            }
            newFilteredData.push(rowData);
        }
        var selectAllCheckBoxes = this.template.querySelectorAll('[data-id="selectAllCheckbox"]');
        var selectAllSetTo = false;
        if(selectedRows.size == (filteredData.length + newFilteredData.length)){
            selectAllSetTo = true;
        }
        for(var index=0; index < selectAllCheckBoxes.length; index++){
            selectAllCheckBoxes[index].checked = selectAllSetTo;
        }
        this.data = filteredData;
        this.newRows = newFilteredData;
    }
    selectDeselectAll(event){
        let checkboxIndex;
        let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]')
        //console.log(checkboxes.length);
        for(checkboxIndex=0; checkboxIndex<checkboxes.length; checkboxIndex++) {
            checkboxes[checkboxIndex].checked = event.target.checked;
        }
        /*
        this.totalSelectedBalance = 0;
        this.totalCheckedCount = 0;
        if(event.target.checked == true){
            for(var rowIndex=0; rowIndex<this.data.length; rowIndex++) {
                this.totalSelectedBalance += this.data[rowIndex]['balance'];
                this.totalCheckedCount += 1;
            }
        }*/
        

        this.recalculateCosts();
        this.highlightRows();
    }

    deleteSelectedRows(event){
        let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]');
        var filteredData = [];
        var newFilteredData = [];
        var selectedRows = new Set()
        for(var checkboxIndex=0; checkboxIndex<checkboxes.length; checkboxIndex++) {
            if(checkboxes[checkboxIndex].checked == true){
                selectedRows.add(checkboxes[checkboxIndex].name);
            }
        }
        for(var dataIndex=0; dataIndex < this.data.length; dataIndex++){
            var rowData = this.data[dataIndex];
            if(selectedRows.has(rowData['id']) == false){
                filteredData.push(rowData);
            }else{
                this.totalSelectedBalance -= rowData['balance'];
                this.totalCheckedCount -= 1;
                this.totalRowCount -= 1;
            }
        }
        for(var dataIndex=0; dataIndex < this.newRows.length; dataIndex++){
            var rowData = this.newRows[dataIndex];
            if(selectedRows.has(rowData['id']) == false){
                newFilteredData.push(rowData);
            }else{
                this.totalSelectedBalance -= rowData['balance'];
                this.totalCheckedCount -= 1;
                this.totalRowCount -= 1;
            }
        }
        this.data = filteredData;
        this.newRows = newFilteredData;
        this.recalculateCosts();
    }

    saveNewRows(){
        var newFinalData = [];
        for(var dataIndex=0; dataIndex < this.data.length; dataIndex++){
            var rowData = this.data[dataIndex];
            if(rowData['highlighted'] == "highlightedRow"){
                rowData['isChecked'] = true;
            }
            newFinalData.push(rowData);
        }
        for(var dataIndex=0; dataIndex < this.newRows.length; dataIndex++){
            var rowData = this.newRows[dataIndex];
            if(rowData['highlighted'] == "highlightedRow"){
                rowData['isChecked'] = true;
            }
            newFinalData.push(rowData);
        }
        this.data = newFinalData;
        this.newRows = [];
        this.isSaveDisabled = true;
    }

    updateNewRows(event){
        var toBeSavedField = event.target.name;
        var recId = event.target.dataset.id;
        var toBeSavedValue = event.target.value;
        var newFilteredData = [];
        for(var dataIndex=0; dataIndex < this.newRows.length; dataIndex++){
            var rowData = this.newRows[dataIndex];
            if(rowData['id'] == recId){
                if(toBeSavedField == 'balance' || toBeSavedField == 'minPaymentPercentage'){
                    toBeSavedValue = parseInt(toBeSavedValue);
                }
                rowData[toBeSavedField] = toBeSavedValue;
                newFilteredData.push(rowData);
            }else{
                newFilteredData.push(rowData);
            }
        }
        this.newRows = newFilteredData;
        this.recalculateCosts();
    }

    addNewRow(event){
        this.newIdGenerator += 1;
        var newId = this.newIdGenerator;
        var newRow = {"id":newId,"balance":0, "creditorName":"","firstName":"","lastName":"","minPaymentPercentage":0,"highlighted":"nonHighlightedRow"};
        var newRowsCreated = []
        for(var newRowIdx = 0; newRowIdx < this.newRows.length; newRowIdx++){
            newRowsCreated.push(this.newRows[newRowIdx]);
        }
        newRowsCreated.push(newRow);
        this.newRows = newRowsCreated;
        this.totalRowCount += 1;
        this.isSaveDisabled = false;
    }

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
        const newRowIndex = this.findNewRowIndexById(id);
        if(newRowIndex !== -1){
            this.newRows = this.newRows
                .slice(0, newRowIndex)
                .concat(this.newRows.slice(newRowIndex + 1));
        }
    }

    recalculateCosts(){
        var checkboxes = this.template.querySelectorAll('[data-id="checkbox"]');
        var selectedRows = new Set();
        for(var checkboxIndex=0; checkboxIndex<checkboxes.length; checkboxIndex++) {
            if(checkboxes[checkboxIndex].checked == true){
                selectedRows.add(checkboxes[checkboxIndex].name);
            }
        }
        this.totalSelectedBalance = 0;
        this.totalCheckedCount = 0;
        for(var rowIndex=0; rowIndex<this.data.length; rowIndex++) {
            if(selectedRows.has(this.data[rowIndex]['id'])){
                this.totalSelectedBalance += this.data[rowIndex]['balance'];
                this.totalCheckedCount += 1;
            }
        }
        
        for(var rowIndex=0; rowIndex<this.newRows.length; rowIndex++) {
            if(selectedRows.has(this.newRows[rowIndex]['id'])){
                this.totalSelectedBalance += this.newRows[rowIndex]['balance'];
                this.totalCheckedCount += 1;
            }
        }
    }
    
    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    findNewRowIndexById(id){
        let ret = -1;
        this.newRows.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }
}
