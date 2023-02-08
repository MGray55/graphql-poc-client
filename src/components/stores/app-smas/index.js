import { getSmas } from '../../utility/api/services/smas';
export const fetchSmaList = async (workspaceId) => {
   //  dispatchSmaAction(SmasActions.getListLoading());
    try {
        const smas = await getSmas(workspaceId);
        // dispatchSmaAction(SmasActions.getListSuccessful(smas, workspaceId));
        return smas;
    } catch(e) {
        console.error('There was a problem fetching smas', e);
        // dispatchSmaAction(SmasActions.getListFailed());
    }
};