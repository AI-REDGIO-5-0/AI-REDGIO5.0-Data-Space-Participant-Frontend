<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { clone } from 'ramda';
import { useI18n } from 'vue-i18n';
import { DialogWrapper } from 'vue3-promise-dialog';

import { confirmation } from '~/composables/confirmation';
import { countries, sectors } from '~/interfaces';
import type { AccessPolicyDetails } from '~/interfaces/plan-designer';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    selected: {
        type: Object,
        required: true,
    },
    policyData: {
        type: Array<AccessPolicyDetails>,
        required: true,
    },
    selectedPolicy: Object
});
let policyData = ref(clone(props.policyData));

const selectedPolicy = ref<AccessPolicyDetails | null>(null);

const accessPolicyDetails = ref<AccessPolicyDetails>({
    id: undefined,
    title: undefined,
    description: undefined,
    default: false,
    // scopes: [],
    groups: [],
    countries: [],
    sizes: [],
    categories: [],
    domains: [],
    types: [],
    trustLevel: undefined,
});
// const checkedScopes = ref<Array<boolean>>([]);
const checkedGroups = ref<Array<any>>([]);
const checkedCountries = ref<Array<boolean>>([]);
const checkedSizes = ref<Array<boolean>>([]);
const checkedCategory = ref<Array<boolean>>([]);
const checkedDomains = ref<Array<boolean>>([]);
const checkedTypes = ref<Array<boolean>>([]);
const checkTrustLvl = ref<any>(undefined);
const switchPolicyForm = ref(false);
const allDomains = sectors;
const allCountries = countries;

const trustOptions = [
    { id: 1, label: 'Very High' },
    { id: 2, label: 'High' },
    { id: 3, label: 'Medium' },
    { id: 4, label: 'Low' },
    { id: 5, label: 'Very Low' },
];

const allSizes = [{ id: 1, name: 'Micro (1–9 employees)' }, { id: 2, name: 'Small (10–49 employees)' }, { id: 3, name: 'Medium (50–249 employees)' }, { id: 4, name: 'Large (250+ employees)' }]
const allCategories = [{ id: 1, name: 'Non-Governmental Organization (NGO)' }, 
{ id: 2, name: 'For-Profit Organization' }, 
{ id: 3, name: 'Academic Institution / University' }, 
{ id: 4, name: 'Research Institution' },
{ id: 5, name: 'Government Agency / Public Institution' },
{ id: 6, name: 'Didactic Factory / Training Organization / Living Lab' },
{ id: 7, name: 'Industry Association / Consortium' }];
// const allTypes = await useFetch<any>('/api/iam/get-types');
// const groupOptions = await useFetch<any>('/api/iam/get-organizations');
const policiesCount = ref(props.policyData.length);

const columns = [
    // {
    //     key: 'id',
    //     label: t('policies.tableFields.id'),
    //     direction: 'asc',
    //     class: 'w-1/12',
    // },
    {
        key: 'title',
        label: t('policies.tableFields.title'),
        sortable: true,
        direction: 'asc',
        class: 'w-2/12',
    },
    {
        key: 'description',
        label: t('policies.tableFields.desc'),
        sortable: true,
        direction: 'asc',
        class: 'w-8/12',
    },
    {
        key: 'useage',
        class: 'w-8/12',
    },
    {
        key: 'actions',
        class: 'w-1/12',
    },
];

const tabItems = [
    {
        key: 'domain',
        label: t('policies.tabs.domain.label'),
        icon: 'i-heroicons-tag',
        content: t('policies.tabs.domain.content'),
    },
    {
        key: 'country',
        label: t('policies.tabs.country.label'),
        icon: 'i-heroicons-flag',
        content: t('policies.tabs.country.content'),
    },
    {
        key: 'size',
        label: t('policies.tabs.size.label'),
        icon: 'i-heroicons-briefcase',
        content: t('policies.tabs.size.content'),
    },
    {
        key: 'category',
        label: t('policies.tabs.category.label'),
        icon: 'i-heroicons-eye-dropper',
        content: t('policies.tabs.category.content'),
    },
];


const handleNewPolicyClick = (asset: any) => {
    accessPolicyDetails.value = {
        id: undefined,
        title: undefined,
        description: undefined,
        default: false,
        categories: [],
        groups: [],
        countries: [],
        sizes: [],
        domains: [],
        types: [],
        trustLevel: checkTrustLvl.value ?? undefined,
    };

    checkedGroups.value = [];
    for (let i = 0; i < allDomains.length; i++) {
        checkedDomains.value[i] = false;
    }
    for (let i = 0; i < allCountries.length; i++) {
        checkedCountries.value[i] = false;
    }
    for (let i = 0; i < allSizes.length; i++) {
        checkedSizes.value[i] = false;
    }

    for (let i = 0; i < allCategories.length; i++) {
        checkedCategory.value[i] = false;
    }


    switchPolicyForm.value = true;
};

const handlePolicyForm = async () => {
    let newPolicies

    let groups = [];
    for (let i = 0; i < checkedGroups.value.length; i++) {
        groups.push(checkedGroups.value[i].toString());
    }

    let countries = [];
    for (let i = 0; i < allCountries.length; i++) {
        if (checkedCountries.value[i] === true) {
            countries.push(allCountries[i].id);
        }
    }

    let sizes = [];
    for (let i = 0; i < allSizes.length; i++) {
        if (checkedSizes.value[i] === true) {
            sizes.push(allSizes[i].id);
        }
    }

    let categories = [];
    for (let i = 0; i < allCategories.length; i++) {
        if (checkedCategory.value[i] === true) {
            categories.push(allCategories[i].id);
        }
    }

    let domains = [];
    for (let i = 0; i < allDomains.length; i++) {
        if (checkedDomains.value[i] === true) {
            domains.push(allDomains[i].id);
        }
    }

    let isValid = true;
    let errorKeys = [];
    if (accessPolicyDetails.value.title === undefined || accessPolicyDetails.value.title.length < 5) {
        isValid = false;
        errorKeys.push('policies.errors.title');
    }
    if (accessPolicyDetails.value.description === undefined || accessPolicyDetails.value.description.length < 5) {
        isValid = false;
        errorKeys.push('policies.errors.description');
    }

    if (!isValid) {
        for (let i = 0; i < errorKeys.length; i++) {
            showErrorMessage(t(errorKeys[i]));
        }
    } else {
        let p: Record<string, any> = {};
        
        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            p.id = policyData.value.length + 1; // number
        } else {
            p.id = Number(accessPolicyDetails.value.id); // cast to number just in case
        }

        const trustLvl = checkTrustLvl.value !== undefined ? trustOptions.find((option) => option.id === checkTrustLvl.value.id)?.id : null;

        p.title = accessPolicyDetails.value.title;
        p.description = accessPolicyDetails.value.description;
        p.default = false;
        p.groups = groups;
        p.countries = countries;
        p.sizes = sizes;
        p.domains = domains;
        p.catagory = categories;
        p.trustLevel = trustLvl;

        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            policyData.value.push(p as unknown as AccessPolicyDetails);
        } else {
            policyData.value[p.id - 1] = p as unknown as AccessPolicyDetails;
        }

        try {
            await $fetch(`/api/datasets/policies`, {
                method: 'post',
                body: p,
            });
        } catch (e) {
            console.log(e)
        }

        policyData.value = await $fetch(`/api/datasets/policies`, {
            method: 'get',
        });

        switchPolicyForm.value = false;
        page.value = Math.floor(policyData.value.length / pageCount) + 2;
        page.value = 1;

    }
};


const handleEditPolicyClick = (row: any) => {
    accessPolicyDetails.value = row;
    // checkTrustLvl.value = row.trustLevel ?? undefined;


    checkedGroups.value = accessPolicyDetails.value.groups;

        checkTrustLvl.value = trustOptions.find((option) => option.id === row.trustLevel)?.label ?? undefined;


    for (let i = 0; i < allDomains.length; i++) {
        const domainId = allDomains[i].id.toString(); // convert to string
        checkedDomains.value[i] = accessPolicyDetails.value.domains.includes(domainId);
    }

    for (let i = 0; i < allCountries.length; i++) {
        const countryId = allCountries[i].id.toString(); // convert to string
        checkedCountries.value[i] = accessPolicyDetails.value.countries.includes(countryId);
    }

    for (let i = 0; i < allSizes.length; i++) {
        const sizeId = allSizes[i].id.toString(); // convert to string
        checkedSizes.value[i] = accessPolicyDetails.value.sizes.includes(sizeId);
    }

    for (let i = 0; i < allCategories.length; i++) {
        const categoryId = allCategories[i].id.toString(); // convert to string
        checkedCategory.value[i] = accessPolicyDetails.value.categories.includes(categoryId);
    }


    switchPolicyForm.value = true;
};

const handleDeletePolicy = async (row: any) => {
    try {
        await $fetch(`/api/datasets/policy/${row.id}`, {
                    method: 'DELETE',
                });
    } catch (e) {
        console.error('Error deleting policy:', e);
    }
};

watch(() => props.selectedPolicy, (newPolicy) => {
    if (newPolicy) {
        selectedPolicyId.value = newPolicy.id;
    }
});

const actions = (row: any) => {
    return [
        [
            {
                label: t('policies.actions.edit'),
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => {
                    handleEditPolicyClick(row);
                },
            },
            {
                label: t('policies.actions.delete'),
                icon: 'i-heroicons-trash-20-solid',
                click: async () => {
                    if (await confirmation(t('policies.delete.title'), t('policies.delete.text'))) {
                        policyData.value.splice(
                            policyData.value.findIndex((item) => item.id === row.id),
                            1,
                        );
                        handleDeletePolicy(row);
                    }
                },
            },
        ],
    ];
};

const page = ref<number>(1);
const pageCount: number = 5;
const rows = computed(() => {
    return policyData.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
const emit = defineEmits(['select-policy']);
const selectedPolicyId = ref(null);



const handleRowClick = (policy: any) => {
    console.log(policy)
    selectedPolicyId.value = policy.id;
    emit('select-policy', policy);
};

</script>

<template>
    <DialogWrapper />
    <Transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-300 ease-in" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <UForm ref="formRef" class="flex flex-col w-full">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('policies.title')" :info="$t('policies.info')" />
                </template>
                <UTable :key="policiesCount" :columns="columns" :rows="rows">
                    <template #title-data="{ row }">
                        <div class="text-left font-semibold">
                            <span>{{ row.title }}</span>
                        </div>
                    </template>

                    <template #description-data="{ row }">
                        <div class="text-left font-semibold">
                            <span>{{ row.description }}</span>
                        </div>
                    </template>

                    <template #useage-data="{ row }">
                        <UButton @click="handleRowClick(row)" :class="[{
                            'bg-primary-900 h-full': selectedPolicyId === row.id, // Highlight selected row
                            'cursor-pointer hover:bg-blue-300 h-full': true,
                        }]">{{ $t('policies.actions.use') }}</UButton>
                    </template>

                    <template #actions-data="{ row }">
                        <div v-if="row.id === '1'"></div>
                        <div v-else>
                            <UDropdown :items="actions(row)">
                                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                            </UDropdown>
                        </div>
                    </template>

                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="policyData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="policyData.length" />
                </div>

                <UButton @click="handleNewPolicyClick(selected)">{{ $t('policies.actions.add') }}</UButton>
            </UCard>
        </UForm>
    </Transition>
    <!-- Modal -->
    <UModal v-model="switchPolicyForm" class="flex flex-grow">
        <UCard class="flex flex-col text-gray-700">
            <UAlert :title="t('policies.policyUI.defText')" class="mt-5" color="primary" />

            <input v-model="accessPolicyDetails.id" type="hidden" />
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <UFormGroup :label="$t('policies.policyUI.defName')">
                        <UInput v-model="accessPolicyDetails.title" placeholder="" />
                    </UFormGroup>
                </div>
            </div>
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <UFormGroup :label="$t('policies.policyUI.defDesc')">
                        <UTextarea v-model="accessPolicyDetails.description" placeholder="" />
                    </UFormGroup>
                </div>
            </div>

            <!-- <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700">{{ t('policies.policyUI.defScope') }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defScopeHelp') }}</small>
                    <div class="flex flex-row w-full">
                        <div class="flex gap-2 flex-col w-1/5">
                            <UCheckbox v-model="checkedScopes[0]" name="scopes[]" label="READ" />
                        </div>
                        <div class="flex gap-2 flex-col w-1/5">
                            <UCheckbox v-model="checkedScopes[1]" name="scopes[]" label="TRADE" />
                        </div>
                    </div>
                </div>
            </div> -->

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                        t('policies.policyUI.defOrg')
                    }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defOrgHelp') }}</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <USelectMenu v-model="checkedGroups" searchable
                            :searchable-placeholder="$t('policies.policyUI.defOrgPrompt')" :options="['test1', 'test']"
                            multiple :placeholder="$t('policies.policyUI.defOrgPrompt')" class="w-full">
                            <!-- "groupOptions.data.value" -->
                            <template #label>
                                <span v-if="checkedGroups.length" class="truncate">{{ checkedGroups.join(', ') }}</span>
                                <span v-else>{{ t('policies.policyUI.defOrgPrompt') }}</span>
                            </template>
                        </USelectMenu>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                        t('policies.policyUI.defOrgTrust')
                    }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defOrgHelpTrustLVL') }}</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <USelectMenu v-model="checkTrustLvl" searchable
                            :searchable-placeholder="$t('policies.policyUI.defOrgPromptTrustLVL')" :options="trustOptions"
                            :placeholder="$t('policies.policyUI.defOrgPrompt')" class="w-full">
                        </USelectMenu>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                        t('policies.policyUI.defAttr')
                    }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defAttrHelp') }}</small>
                </div>
            </div>

            <UTabs :items="tabItems" class="w-full">
                <template #item="{ item }">
                    <UCard>
                        <template #header>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {{ item.content }}
                            </p>
                        </template>

                        <div v-if="item.key === 'domain'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox v-for="(attr, index) in allDomains" :key="attr.id"
                                        v-model="checkedDomains[index]" name="domains[]" :label="attr.name" />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'country'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox v-for="(attr, index) in allCountries" :key="attr.id"
                                        v-model="checkedCountries[index]" name="countries[]" :label="attr.name" />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'size'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox v-for="(attr, index) in allSizes" :key="attr.id"
                                        v-model="checkedSizes[index]" name="sizes[]" :label="attr.name" />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'category'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox v-for="(attr, index) in allCategories" :key="attr.id"
                                        v-model="checkedCategory[index]" name="categories[]" :label="attr.name" />
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>
            </UTabs>

            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchPolicyForm = false">{{
                    $t('cancel')
                }}</UButton>
                <UButton class="w-20 flex justify-center" @click="handlePolicyForm()">{{
                    $t('policies.actions.save')
                }}</UButton>
            </div>
        </UCard>
    </UModal>
</template>

<style lang="css">
.policy-modal {
    @apply w-96;
}

@media (min-width: 640px) {
    .sm\:max-w-lg {
        max-width: 72rem;
    }
}

@media (min-width: 640px) {
    .dialog .sm\:max-w-lg {
        max-width: 36rem;
    }
}
</style>
