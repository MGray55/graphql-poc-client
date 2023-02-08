// imports from outside node_modules need to be relative in this file for server side use as node does not yet support absolute paths with ES modules
// import { toolsMode } from '../cms/cms';
import {  CONTENT_SITE } from '../../constants/app';

//The first one gets only published custom disclosures, the other gets all of them, even the ones in draft status
//Use second one for testing purposes
const isBrowser = typeof window !== 'undefined' ? window : undefined;
const currentHost = isBrowser?.location?.hostname === 'localhost' ? `${CONTENT_SITE.dev}` : `https://${isBrowser?.location?.host}`;

// window does not exist server side
// some pdf exports are rendered server side

const apiDomainBaseUrl = isBrowser?.servicesApiBaseUrl || 'https://data-dev.dimensional.com/'
const ddxModelsBaseUrl = `${apiDomainBaseUrl}/ddx_models`;
// const ddxModelsBaseUrl = toolsMode === APP_MODE.public || toolsMode === APP_MODE.deNav ? apiDomainBaseUrl : `${apiDomainBaseUrl}/ddx_models`;

const smaBaseUrl = `${apiDomainBaseUrl}/sma`;
const cmsBaseUrl = process.env.CMS_BASE_URL || '';

export default () => ({
	cmsLabel: `${cmsBaseUrl}/investment-api/app-settings/ddxtools`,
	
	disclosures: `${currentHost}/investment-api/portfolio-disclosures`,
	portfolioDetails: `${currentHost}/investment-api/portfolio-details`,

	associatedIndices: `${ddxModelsBaseUrl}/v2/indices/associated`,
	availableComparativeIndices: `${ddxModelsBaseUrl}/v2/indices/series/comparative/available`,
	availableIndices: `${ddxModelsBaseUrl}/v2/indices/series/associated/available`,
	currencies: `${ddxModelsBaseUrl}/v2/currencies`,
	dimensionalSnapshot: `${ddxModelsBaseUrl}/v2/modelbuild/snapshot/dimensional`,
	distributionHistory: `${ddxModelsBaseUrl}/v2/portfolios/distributions/history/csv`,
	exportModels: `${ddxModelsBaseUrl}/v2/models/export`,
	favorites: `${ddxModelsBaseUrl}/v2/favorites`,
	features: `${ddxModelsBaseUrl}/v2/features`,
	firmSnapshot: `${ddxModelsBaseUrl}/v2/modelbuild/snapshot/firm`,
	// fundCenter: toolsMode === APP_MODE.deNav ? `${ddxModelsBaseUrl}/v2/fundcenter/navs/de` : `${ddxModelsBaseUrl}/v2/fundcenter`,
	fundCharacteristics: `${ddxModelsBaseUrl}/v2/portfolios/characteristics/history/xlsx`,
	fundCompare: `${ddxModelsBaseUrl}/v2/fundcenter/compare`,
	fundDetails: `${ddxModelsBaseUrl}/v2/fundcenter/funddetail`,
	fundPerformance: `${ddxModelsBaseUrl}/v2/fundcenter/performance`,
	fundsGrowthOfWealth: `${ddxModelsBaseUrl}/v2/fundcenter/compare/lenses/growthOfWealth`,
	importModels: `${ddxModelsBaseUrl}/v2/models/import`,
	lens: `${ddxModelsBaseUrl}/v2/modelbuild/compare/lenses`,
	modelCalculate: `${ddxModelsBaseUrl}/v2/modelbuild/calculate`,
	modelCompare: `${ddxModelsBaseUrl}/v2/modelbuild/compare`,
	modelCompareExcel: `${ddxModelsBaseUrl}/v2/modelbuild/compare/xlsx`,
	models: `${ddxModelsBaseUrl}/v2/models`,							// available: GET, POST, DELETE, PUT
	modelsGrowthOfWealth: `${ddxModelsBaseUrl}/v2/modelbuild/compare/lenses/growthOfWealth`,
	morningstarFunds: `${ddxModelsBaseUrl}/v2/morningstar/funds`,
	morningstarFundSearch: `${ddxModelsBaseUrl}/v2/search/morningstar/funds`,
	portfolioBenchmarks: `${ddxModelsBaseUrl}/v2/portfolios/benchmarks/series`,
	portfolioFilters: `${ddxModelsBaseUrl}/v2/portfolios/filters`,
	portfolioSearch: `${ddxModelsBaseUrl}/v2/search/portfolios`,
	priceHistory: `${ddxModelsBaseUrl}/v2/portfolios/prices/history/csv`,
	session: `${ddxModelsBaseUrl}/oauth2/session?method=iframe`,
	smasGrowthOfWealth: `${ddxModelsBaseUrl}/v2/modelbuild/compare/lenses/growthOfWealth`,
	snapshot: `${ddxModelsBaseUrl}/v2/modelbuild/snapshot`,
	
	baseStrategies: `${smaBaseUrl}/v2/base_strategies`,
	constituents: `${smaBaseUrl}/v2/constituents`,
	smaFeatures: `${smaBaseUrl}/v2/features`,
	workspaces: `${smaBaseUrl}/v2/workspaces`,
	submitForReview: `${smaBaseUrl}/v2/smas/:smaId/request/review`,
	submitForTrading: `${smaBaseUrl}/v2/smas/:smaId/request/trading`,
	transitionAnalysisRequest: `${smaBaseUrl}/v2/smas/:smaId/request/transition`,
	availableComparativeIndicesSma: `${smaBaseUrl}/v2/indices/comparative`,
	
	companyCustomizations: `${smaBaseUrl}/v2/securities`,
	companyCustomizationSearch: `${smaBaseUrl}/v2/search/securities`,
	countryCustomizationOptions: `${smaBaseUrl}/v2/strategy/investment_customizations/country_of_exposure`,
	currentUser: `${smaBaseUrl}/v2/users/me`,
	custodianBanks: `${smaBaseUrl}/v2/custodian_banks`,
	defaultTaxRates: `${smaBaseUrl}/v2/default_tax_rates`,
	downloadTransition: `${smaBaseUrl}/v2/reports/transition`,
	gicsCustomizationOptions: `${smaBaseUrl}/v2/strategy/investment_customizations/gics`,
	inelCustomizationOptions: `${smaBaseUrl}/v2/strategy/investment_customizations/inel`,
	liveReport: `${smaBaseUrl}/v2/reports/live`,
	proposalReport: `${smaBaseUrl}/v2/reports/proposal`,
	taxManagement: `${smaBaseUrl}/v2/tax_management`,

	smas: `${smaBaseUrl}/v2/smas`,
	singleSma: `${smaBaseUrl}/v2/smas/:smaId`,
	customTaxRates: `${smaBaseUrl}/v2/smas/:smaId/custom_tax_rates`,
	files: `${smaBaseUrl}/v2/smas/:smaId/files`,
	funding: `${smaBaseUrl}/v2/smas/:smaId/funding`,
	fundingFiles: `${smaBaseUrl}/v2/smas/:smaId/funding/files`,
	smaHistory: `${smaBaseUrl}/v2/smas/:smaId/request/history`,
	transitionAllScenarios: `${smaBaseUrl}/v2/smas/:smaId/transition/all_scenarios`,
	transitionGenericScenarios: `${smaBaseUrl}/v2/smas/transition/generic_scenarios`,
	transitionPlan: `${smaBaseUrl}/v2/smas/:smaId/transition/plan`,
	transitionScenariosDownload: `${smaBaseUrl}/v2/smas/:smaId/transition/analysis_report`,
});