import { authenticatedRequest } from '../api';

const mapSmaCrud = (sma) => {
    const smas = {
        identifier: sma.identifier,
        flags: sma.flags,
        parentIdentifier: sma.parentIdentifier,
        children: sma.children,
        status: sma.status,
        name: sma.name,
        displayIdentifier: sma.displayIdentifier,
        strategy: sma.strategy,
        custodianAccountInfo: {
            account: {
                number: sma?.custodianAccountInfo?.account?.number,
                registrationName: sma?.custodianAccountInfo?.account?.registrationName,
            },
            bank: {
                identifier: sma?.custodianAccountInfo?.bank?.identifier,
                name: sma?.custodianAccountInfo?.bank?.name,
            },
        },
        investmentAccountInfo: {
            taxManagementSlug: sma?.investmentAccountInfo?.taxManagementSlug
        },
        targetFunding: {
            value: sma?.targetFunding?.value,
            display: sma?.targetFunding?.display
        },
        fundAum:{
            date:{
                value: sma?.fundAum?.date?.value,
                display: sma?.fundAum?.date?.display,
            },
            aum:{
                value: sma?.fundAum?.aum?.value,
                display: sma?.fundAum?.aum?.display,
            },
            dfaCurrencyCode: sma?.fundAum?.dfaCurrencyCode,
        }
    };

    return smas;
}
export const getSmas = async (workspaceId) => {
    try {
        // let url = `${endpoints().smas}?workspaceIds=${workspaceId}`;
        let url = 'https://data-dev.dimensional.com/sma/v2/smas?workspaceIds=2b4dfa7f-0905-4903-99c0-496b385139a7';
        if (workspaceId === null) {
            url += '&ownerIdentifier=me';
        }
        const response = await authenticatedRequest({
            url,
        });

        if(!response?.data || !Array.isArray(response?.data)){
            console.error("getSmas:", {response, url});
            console.info("response data is empty or wrong format while getting smas");
        }
        const data = response?.data || [];
        return data.map(rawSma => mapSmaCrud(rawSma));

    }
    catch (e) {
        console.error('There was a problem retrieving available smas', e);
        throw e;
    }

};

