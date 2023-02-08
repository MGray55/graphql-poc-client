import React, { Component, useContext } from "react";
import { endpoints, authenticatedRequest } from "../utility/api/api";
import { subscribe, EVENT_TYPES, unsubscribe } from "../utility/events";
import establishSession, { STATUS } from "../../auth/gateway-session-negotiator";

class HomeClass extends Component {
	constructor() {
		super();
		this.state = {
			toastCopy: "",
			isModelBuildDisabled: true,
			fundFiltersLoading: true,
			showUserLicense: false,
			showApiUnavailable: false,
			userPermissionsLoading: false
		};
	}

	componentDidMount() {
		subscribe(EVENT_TYPES.API_UNAVAILABLE, this.openApiUnavailableModal);
		// this.init();
		this.authenticate();
		// CMS.toolsMode === APP_MODE.public || CMS.toolsMode === APP_MODE.deNav
		// 	? this.init()
		// 	: this.authenticate();
	}

	componentWillUnmount() {
		unsubscribe(EVENT_TYPES.API_UNAVAILABLE, this.openApiUnavailableModal);
	}

	authenticate = () => {
		establishSession(
			({ status, loginUrl }) => {
				const { fundsDispatch, modelsDispatch } = this.props;
				switch (status) {
					case STATUS.LOGIN_REQUIRED:
						// gotoLoginPage(loginUrl);
						console.warn('Need to log in again');
						break;
					case STATUS.FAILED:
						this.openApiUnavailableModal();
						console.warn('Log in failed');
						// fundsDispatch(FundsActions.getListFailed());
						// modelsDispatch(ModelsActions.getListFailed());
						// dispatchSmaAction(SmasActions.getListFailed());
						this.setState({
							isFundFiltersError: true,
							fundFiltersLoading: false,
						});
						break;
					default:
						this.init();
						break;
				}
			},
			{ gatewaySessionUrl: endpoints().session }
		);
	};

	init = () => {
		// const { fundsDispatch, modelsDispatch, favoriteContext } = this.props;
		// const { views } = this.state;
		// const isSmaAccess =
		// 	CMS?.apps?.includes("dd:sma") === APPS.includes("dd:sma") &&
		// 	!views.find((view) => view.id === "smas");
		// if (CMS.toolsMode !== APP_MODE.public && CMS.toolsMode !== APP_MODE.deNav) {
		// 	favoriteContext.fetchList();
		// 	modelsDispatch(ModelsActions.fetchList());
		// 	this.initUserPermissions(isSmaAccess);
		// 	this.initCurrencies();
		// 	this.initPortfolioFilters();
		// } else {
		// 	this.initPortfolioFilters();
		// }
		// fundsDispatch(FundsActions.fetchList());
	};

	initUserPermissions = async (isSmaAccess) => {
		const ddxPromise = authenticatedRequest({
			url: endpoints().features,
		});

		const smaPromise = isSmaAccess
			? authenticatedRequest({
					url: endpoints().smaFeatures,
			  })
			: Promise.resolve({ data: { features: [] } });
		const results = await Promise.allSettled([ddxPromise, smaPromise]);
		const [{ value: ddxValue, reason: ddxReason }, { value: smaValue, reason: smaReason }] =
			results;
		if (ddxValue) {
			if (!ddxValue.error) {
				this.props.ddxPermissions.setPermissions(ddxValue.data.features);
			} else {
				console.error("error retrieving ddx permissions:", ddxValue.errorText);
			}
		} else {
			console.error("error retrieving ddx permissions:", ddxReason);
		}
		if (smaValue) {
			if (!smaValue.error) {
				this.props.smaPermissions.setPermissions(smaValue.data.features);
			} else {
				console.error("error retrieving sma permissions:", smaValue.errorText);
			}
		} else {
			console.error("error retrieving sma permissions:", smaReason);
		}
		this.setState({ userPermissionsLoading: false });
	};

	// initCurrencies = () => {
	// 	authenticatedRequest({
	// 		url: endpoints().currencies,
	// 		success: (response) => {
	// 			CurrencyFactory.initializeCurrencies(response);
	// 		},
	// 		error: (err) => {},
	// 	});
	// };

	componentDidUpdate(prevProps, prevState) {
		const { fundsState, modelsState } = this.props;
		const { fundFiltersLoading, isFundFiltersError, views } = this.state;
		const prevFundsState = prevProps.fundsState;
		const prevModelsState = prevProps.modelsState;

		if (modelsState &&
			!modelsState.loading &&
			!fundsState.loading &&
			!fundFiltersLoading &&
			(prevModelsState.loading || prevFundsState.loading || prevState.fundFiltersLoading) &&
			!fundsState.error &&
			!isFundFiltersError &&
			!modelsState.error
		) {
			this.activateModelBuild();
		}
	}

	setToast = (copy) => {
		this.setState({
			toastCopy: copy,
		});
	};

	activateModelBuild = () => {
		this.setState({
			isModelBuildDisabled: false,
		});
	};

	changeAppView = (appViewId, history) => {
		const { views } = this.state;
		const matchingView = views.find((view) => view.id === appViewId);
		this.props.updateSelectedIds([]);
		if (matchingView) {
			history.push(matchingView.path);
		}
	};

	openApiUnavailableModal = () => {
		if (this.state.showApiUnavailable) {
			return;
		}

		this.setState({
			showApiUnavailable: true,
		});
	};

	closeApiUnavailableModal = () => {
		this.setState({
			showApiUnavailable: false,
		});
	};

	openUserLicenseModal = () => {
		this.setState({
			showUserLicense: true,
		});
	};

	closeUserLicenseModal = () => {
		this.setState({
			showUserLicense: false,
		});
	};

	render() {
		const { fundsState, modelsState, isMobile } = this.props;
		const {
			isModelBuildDisabled,
			isFundFiltersError,
			fundFiltersLoading,
			userPermissionsLoading,
			views,
		} = this.state;
		const userLicense = "UserLicense";
		// const content = CMS.getDisclosure(
		// 	CMS.disclosureLevels.Application,
		// 	CMS.applicationDisclosurePages[userLicense],
		// 	CMS.disclosurePositions[userLicense]
		// );
		// const { loading: fundsLoading, error: fundsError } = fundsState;
		// const { loading: modelsLoading, error: modelsError } = modelsState;
		return (
			<div className="tools-home">
				Home
				{/*{CMS.toolsMode !== APP_MODE.public && CMS.toolsMode !== APP_MODE.deNav && !isMobile && (*/}
				{/*	<Header>*/}
				{/*		<Route*/}
				{/*			render={({ history }) => {*/}
				{/*				const activeTabId = (*/}
				{/*					views.find((view) => history.location.pathname.indexOf(view.path) > -1) || {}*/}
				{/*				).id;*/}

				{/*				return (*/}
				{/*					activeTabId && (*/}
				{/*						<Tabs*/}
				{/*							tabs={views}*/}
				{/*							activeTabId={activeTabId}*/}
				{/*							onFocusTab={(id) => this.changeAppView(id, history)}*/}
				{/*						/>*/}
				{/*					)*/}
				{/*				);*/}
				{/*			}}*/}
				{/*		/>*/}
				{/*		<div className="tools-user-license-link">*/}
				{/*			<FakeButton*/}
				{/*				onClick={this.openUserLicenseModal}*/}
				{/*				ariaLabel={*/}
				{/*					"Open " +*/}
				{/*					CMS.getApplicationLabel(*/}
				{/*						(labels) => labels.UserLicense.Buttons.licenseAgreementLinkText*/}
				{/*					)*/}
				{/*				}*/}
				{/*			>*/}
				{/*				{CMS.getApplicationLabel(*/}
				{/*					(labels) => labels.UserLicense.Buttons.licenseAgreementLinkText*/}
				{/*				)}*/}
				{/*			</FakeButton>*/}
				{/*			<a*/}
				{/*				href={CMS.getApplicationLabel(*/}
				{/*					(labels) => labels.UserLicense.Buttons.disclosureDocumentLink*/}
				{/*				)}*/}
				{/*				aria-label={CMS.getApplicationLabel(*/}
				{/*					(labels) => labels.UserLicense.Buttons.disclosureDocumentLinkText*/}
				{/*				)}*/}
				{/*				target="_blank"*/}
				{/*				rel="noopener noreferrer"*/}
				{/*			>*/}
				{/*				{CMS.getApplicationLabel(*/}
				{/*					(labels) => labels.UserLicense.Buttons.disclosureDocumentLinkText*/}
				{/*				)}*/}
				{/*			</a>*/}
				{/*		</div>*/}
				{/*	</Header>*/}
				{/*)}*/}
				{/*<Listing*/}
				{/*	id="funds"*/}
				{/*	type="funds"*/}
				{/*	role="tabpanel"*/}
				{/*	ariaLabel={CMS.getApplicationLabel((labels) => labels.FundListing.Labels.HeaderTab)}*/}
				{/*	setToast={this.setToast}*/}
				{/*	isModelBuildDisabled={isModelBuildDisabled}*/}
				{/*	isLoading={fundsLoading || fundFiltersLoading || userPermissionsLoading}*/}
				{/*	isError={isFundFiltersError || fundsError}*/}
				{/*	isMobile={isMobile}*/}
				{/*/>*/}
				{/*<Listing*/}
				{/*	id="models"*/}
				{/*	type="models"*/}
				{/*	role="tabpanel"*/}
				{/*	ariaLabel={CMS.getApplicationLabel((labels) => labels.ModelListing.Labels.HeaderTab)}*/}
				{/*	setToast={this.setToast}*/}
				{/*	isModelBuildDisabled={isModelBuildDisabled}*/}
				{/*	isError={modelsError || fundsError}*/}
				{/*	isLoading={modelsLoading || fundsLoading || userPermissionsLoading}*/}
				{/*/>*/}
				{/*<Listing*/}
				{/*	id="smas"*/}
				{/*	type="smas"*/}
				{/*	role="tabpanel"*/}
				{/*	ariaLabel={CMS.getApplicationLabel((labels) => labels.SmaListing.Labels.HeaderTab)}*/}
				{/*	setToast={this.setToast}*/}
				{/*	isModelBuildDisabled={isModelBuildDisabled}*/}
				{/*	isLoading={userPermissionsLoading}*/}
				{/*/>*/}
				{/*<Modal*/}
				{/*	handleClose={this.closeUserLicenseModal}*/}
				{/*	isVisible={this.state.showUserLicense}*/}
				{/*	className="tools-modal-user-license"*/}
				{/*	labelledById="modal-userlicense-label"*/}
				{/*>*/}
				{/*	<div>*/}
				{/*		<div className="tools-label-5-left-med-gray" id="modal-userlicense-label">*/}
				{/*			{CMS.getApplicationLabel((labels) => labels.UserLicense.Buttons.LinkText)}*/}
				{/*		</div>*/}
				{/*		<div*/}
				{/*			className="tools-user-license-body"*/}
				{/*			dangerouslySetInnerHTML={{*/}
				{/*				__html: content,*/}
				{/*			}}*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</Modal>*/}
				{/*<Modal*/}
				{/*	header={CMS.getApplicationLabel((labels) => labels.Shared.APIUnavailableModal.errorText)}*/}
				{/*	handleClose={this.closeApiUnavailableModal}*/}
				{/*	handlePrimaryAction={this.closeApiUnavailableModal}*/}
				{/*	primaryLabel={CMS.getApplicationLabel(*/}
				{/*		(labels) => labels.Shared.APIUnavailableModal.closeAria*/}
				{/*	)}*/}
				{/*	isVisible={this.state.showApiUnavailable}*/}
				{/*	className="tools-modal-api-unavailable"*/}
				{/*	labelledById="tools-modal-api-unavailable-label"*/}
				{/*/>*/}
				{/*<Toast*/}
				{/*	isDisplay={this.state.toastCopy.length > 0}*/}
				{/*	copy={this.state.toastCopy}*/}
				{/*	onHide={this.setToast.bind(this, "")}*/}
				{/*/>*/}
				<div className="tools-export-renderspace" aria-hidden></div>
			</div>
		);
	}
}

const Home = (props) => {
	// const favoriteContext = useContext(FavoriteContext);
	// const { state: fundsState, dispatch: fundsDispatch } = useContext(FundsContext);
	// const { state: modelsState, dispatch: modelsDispatch } = useContext(ModelsContext);
	// const ddxPermissions = useDdxPermission();
	// const smaPermissions = useSmaPermission();
	// const updateSelectedIds = useUpdateSelectedListIds();
	// const { isMobileScreenSize: isMobile } = useScreenSize();
	const overrideProps = {
		// ddxPermissions,
		// favoriteContext,
		// fundsDispatch,
		// fundsState,
		// isMobile,
		// modelsDispatch,
		// modelsState,
		// smaPermissions,
		// updateSelectedIds,
	};
	return <HomeClass {...props} {...overrideProps} />;
};

export default React.memo(Home);
