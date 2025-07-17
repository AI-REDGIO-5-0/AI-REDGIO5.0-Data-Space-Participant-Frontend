<script setup lang="ts">
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

import { DatasetKind } from '~/interfaces/dataset.enum';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import type { AccessPolicyDetails, AssetOfferingDetails } from '~/interfaces/plan-designer';

const runtimeConfig = useRuntimeConfig();

// const { data: session } = useAuth();
// const { showSuccessMessage } = useAlertMessage();
const router = useRouter();
const { t } = useI18n();
const submitError = ref(false);
const submitSuccess = ref(false);
const route = useRoute();
const assetId = route.params.id;
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

//TODO: Get ID and data to pass down to DatasetSelector from API call
const selected = ref<
    { id: string | number; title: string; description: string; } | undefined
>(undefined);

const { data: dataset, status: datasetsStatus } = useAsyncData<Record<string, any>>(() =>
    $fetch('/api/datasets/get-specific', { query: { id: assetId } }),
);

watch(dataset, () => {
    if (!dataset.value) return;
    selected.value = {
        id: dataset?.value.id,
        title: dataset.value.title || 'N/A',
        description: dataset.value.description || 'N/A',
    };
    assetOfferingDetails.value.title = selected.value.title;
    assetOfferingDetails.value.description = selected.value.description;
    assetOfferingDetails.value.keywords = dataset.value.keywords
});

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);
const newAssetId = uuidV4();



const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: '',
    description: '',
    keywords: [],
});

// data for publication selections

const { publicationSchema } = usePublicationSchema();

type publicationType = z.infer<typeof publicationSchema>;

const publicationDetails = ref<Partial<publicationType>>({
    type: 'one-off',
    // price: 0,
    license: '',
    // contractTerms: '',
    termDate: '',
    startDate: ''
});

// access policies
const policyData = await useFetch<any>('/api/datasets/policies');


const submitStatus = ref();

const submitAll = async () => {
    submitStatus.value = 'pending';
    
    let body = {
        originalAssetId: selected.value?.id,
        organizationId: runtimeConfig.public?.orgId,
        // organizationName: session.value?.orgName,
        ...assetOfferingDetails.value,
        ...publicationDetails.value,
        termDate: publicationDetails.value.termDate ?? new Date(86400000000000),
        startDate: publicationDetails.value.startDate ?? new Date(86400000000000),
        // distributionId: assetOfferingDetails.value.selectedDistribution.id,
        assetId: newAssetId,
        accessPolicies: {
            assetId: newAssetId,
            assetTitle: assetOfferingDetails.value.title,
            assetDescription: assetOfferingDetails.value.description,
            policyData: selectedPolicy.value || [],
        },
        // sellerId: session.value?.user?.sub,
        numOfResell: 0,
        numOfShare: 0,
    };

    try {
        await $fetch(`/api/datasets/publish-data`, {
            method: 'post',
            body,
        });
        submitStatus.value = 'success';
        await delay(3);

        submitStatus.value = '';
        router.push({ name: 'home' });
    } catch (error) {
        submitStatus.value = 'error';
    }

    return body;
};


const steps = computed(() => [
    { name: t('data.designer.nav.selectDataset'), isActive: true },
    { name: t('data.designer.nav.monetizationPlanner'), isActive: selected.value },
    { name: t('data.designer.nav.preview'), isActive: selected.value && isAllValid.value },
]);

const isAllValid = ref(false);

const selectedPage = ref(1);

const handlePageSelectionBackwards = (value: number) => {
    selectedPage.value = value;
    submitError.value = false;
    submitSuccess.value = false;
};

const changeStep = async (stepNum: number) => {
    if (stepNum === 2) {
        if (!selectedPolicy.value) {
            showErrorMessage('Please select an access policy before proceeding to preview.');
            return; // Prevent changing the step
        }
    }
    selectedPage.value = stepNum;
};

const selectedPolicy = ref(null);

const updateSelectedPolicy = (policy: any) => {
    selectedPolicy.value = policy;
};
</script>

<template>
    <!-- <NavigationSteps :steps="steps" :selected-page="selectedPage" @select-page="changeStep" /> -->

    <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" />

    <div v-show="selectedPage === 1" class="w-full h-full text-gray-700 space-y-8">
        <AssetOfferingDetails v-model:asset-details-prop="assetOfferingDetails"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)" />
        <UCard>
            <div>
                <span>
                    <UIcon name="i-heroicons-information-circle" class="text-gray-500 h-5 w-5 mr-2"></UIcon>
                    The asset will be shared by default with all participants in the data space.
                    If you want to exclude specific organisations or groups of organisations based on their attributes
                    (e.g. type, size etc) you need to add one or more policies below. The rules selected inside the active policy are applied
                    conjunctively. When you click on use button have in mind that this policy will be applied to the asset you are currently publishing.
                </span>
            </div>
        </UCard>

        <AccessPolicyList v-model:policy-data="policyData.data.value" :policy-data-details="policyData.data.value"
            :selected="selected" @select-policy="updateSelectedPolicy"
            @update:policy-data="(value: AccessPolicyDetails[]) => (policyData.data.value = value)" />

        <PublicationMethod v-model:publication-details-prop="publicationDetails"
            :asset-offering-details="assetOfferingDetails" @change-page="changeStep"
            @update:is-all-valid="(value: boolean) => (isAllValid = value)" />

    </div>


    <Preview v-if="isAllValid && selectedPage === 2 && completeOrQuery && selected?.title"
        :publication-details="publicationDetails" :asset-offering-details="assetOfferingDetails"
        :policy="selectedPolicy" :submit-status="submitStatus"
        @handle-page-selection-backwards="handlePageSelectionBackwards" @submit-all="submitAll" />
</template>
