<script setup lang="ts">
// import type ModelsTableRow from '~/interfaces/models-table-row';
// import type TableColumn from '~/interfaces/table-column';
import { languages, sectors } from '~/interfaces';
import dayjs from 'dayjs';

const { t } = useI18n();

const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const columns = [

    {
        key: 'title',
        label: t('models.dmRepository.tableFields.title'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/3',
    },
    {
        key: 'date',
        label: t('models.dmRepository.tableFields.date'),
        sortable: false,
        direction: 'asc',
        class: 'w-1/6',
    },
    {
        key: 'version',
        sortable: false,
        label: t('models.dmRepository.tableFields.version'),
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'language',
        sortable: false,
        label: t('models.dmRepository.tableFields.language'),
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'domain',
        sortable: false,
        label: t('models.dmRepository.tableFields.domain'),
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'filesize',
        sortable: false,
        label: t('models.dmRepository.tableFields.size'),
        class: 'w-1/6 text-slate-600 text-right',
    },
    
    { key: 'actions', label: '', sortable: false, class: 'w-1/12 text-center' },
];

//data for models table
const {
    data: modelsData,
    pending: modelsLoading,
    error: modelsFetchError,
    refresh,
} = await useLazyFetch<any>('/api/datasets/get-all-acquired');


const { page, filteredRows, paginatedRows, searchString, sortBy } = useTable<any>(modelsData, 5, {
    column: 'date',
    direction: 'desc',
});


const actions = (row: any) => [
    [
        // {
        //     label: 'Edit',
        //     icon: 'i-heroicons-pencil-square-20-solid',
        //     click: () => editRepo(row),
        // },
        {
            label: 'Download',
            icon: 'i-heroicons-arrow-down-tray-20-solid',
            click: () => downloadFile(row.title),
        },
    ],
    // [
    //     {
    //         label: 'Delete',
    //         color: 'text-red-400',
    //         icon: 'i-heroicons-trash-20-solid',
    //         class: 'text-red-400',
    //         click: () => {
    //             modelForDeletion.value = row;
    //             deleteConfirmationOpen.value = true;
    //         },
    //     },
    // ],
];

//table functions

async function editRepo(row: any) {
    await navigateTo({
        path: `/my-data/publish-data/${row.id}`,
    });
}

async function publishDataset(row: any) {
    try {
        await $fetch(`/api/datasets/asset`, { query: { id: modelForDeletion.value.id } });
        showSuccessMessage(t('models.successDelete'));
        await refresh();
    } catch (error) {
        showErrorMessage(t('models.errors.delete'));
    } finally {
        modelForDeletion.value = null;
    }
}

const deleteConfirmationOpen = ref(false);
const modelForDeletion = ref<any | null>(null);

async function downloadFile(filename: string) {
    try {
        // Fetch the MinIO signed URL and correct filename from Nitro
        const { url, fileName: correctFileName }: any = await $fetch(`/api/datasets/download`, { query: { file: filename } });
 
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', correctFileName); // Ensure correct filename with extension
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

async function deleteRepo() {
    if (!modelForDeletion.value) return;

    deleteConfirmationOpen.value = false;
    modelsLoading.value = true;
    modelsData.value = null;

    try {
        await $fetch(`/api/datasets/asset`, { query: { id: modelForDeletion.value.id } });
        showSuccessMessage(t('models.successDelete'));
        await refresh();
    } catch (error) {
        showErrorMessage(t('models.errors.delete'));
    } finally {
        modelForDeletion.value = null;
    }
}

const language = (language: any) => {
    return languages.find((item: any) => item.id === Number.parseInt(language))?.name
}

const domain = (domain: any) => {
    return sectors.find((item: any) => item.id === Number.parseInt(domain))?.name
}

const pageCount = 10
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <UCard v-if="!modelsFetchError">
            <div class="flex justify-between flex-1">
                <div class="flex flex-1">
                    <UInput v-model="searchString" size="md" :placeholder="$t('models.dmRepository.search')"
                        class="w-full" />
                </div>

            </div>
            <UTable v-model:sort="sortBy" sort-mode="manual" class="mt-8" :columns="columns" :rows="paginatedRows"
                :loading="modelsLoading">
                <template #date-data="{ row }">
                    {{ dayjs(row.updatedAt).format('DD/MM/YYYY')  }}
                </template>
                <template #version-data="{ row }">
                    <div class="text-center">
                        <span>{{ row.version }}</span>
                    </div>
                </template>
                <template #language-data="{ row }">
                    <div class="text-center">
                        <span>{{ language(row.language) }}</span>
                    </div>
                </template>
                <template #domain-data="{ row }">
                    <div class="text-center">
                        <span>{{ domain(row.domain) }}</span>
                    </div>
                </template>
                <template #size-data="{ row }">
                    <div class="text-right">
                        <span class="font-semibold">{{ row.size }}</span>
                    </div>
                </template>
                <template #actions-data="{ row }">
                    <UDropdown :items="actions(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-vertical-20-solid" />
                    </UDropdown>
                </template>
                
            </UTable>
            <div v-if="filteredRows?.length > pageCount" class="flex justify-end mt-2">
                <div class="mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length"
                        :active-button="{ variant: 'outline' }" />
                </div>
            </div>
        </UCard>
        <UModal v-model="deleteConfirmationOpen">
            <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
                <p class="font-bold text-xl">{{ $t('areYouSure') }}</p>
                <p class="text-gray-400 mt-6">{{ $t('models.deleteModelDescription') }}</p>
                <div class="flex gap-8 w-full justify-center mt-6">
                    <UButton color="white" class="w-20 flex justify-center"
                        @click="(deleteConfirmationOpen = false), (modelForDeletion = null)">{{ $t('cancel') }}
                    </UButton>
                    <UButton class="w-20 flex justify-center" @click="deleteRepo()">{{ $t('yes') }}</UButton>
                </div>
            </UCard>
        </UModal>
        <!-- <ErrorCard v-if="modelsFetchError && !modelsLoading"
            :error-msg="modelsFetchError.data?.data?.message ?? $t('models.errors.retrieveList')" /> -->
    </div>
</template>
