import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

export function HelpDialog({ openDialog, onClose }) {

    return <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle id="alert-dialog-title">{"Schengen Visa Stay Calculator"}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Click on or drag over the days you have spent or plan to spend in the EU Schengen Area. The total number of days spent in the preceeding 180 days is displayed in the bottom right-hand corner of each day. You may be entitled to up to 90 days visa free travel in the Schengen Area. If you log in you can save your calendar and add to it over time.
            </DialogContentText>
            <DialogContentText>
                This website uses cookies to gather anonymous usage data and manage logins where necessary. No data is shared with 3rd parties. This tool is provided "as is" with no warranty. By clicking 'AGREE' below you agree to the use of cookies as described.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary" autoFocus>
                Agree
            </Button>
        </DialogActions>
    </Dialog>

}