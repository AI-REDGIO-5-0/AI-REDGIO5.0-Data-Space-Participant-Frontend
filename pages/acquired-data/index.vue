<script setup lang="ts">
import { languages, sectors } from '~/interfaces';
import dayjs from 'dayjs';
import { useFileDownload } from '~/composables/useFileDownload';

const { t } = useI18n();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const { downloadFile, progress, isDownloading } = useFileDownload();

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
        {
            label: 'Download',
            icon: 'i-heroicons-arrow-down-tray-20-solid',
            click: () => handleDownload(row),
        },
    ],
];

// Handle download with composable
async function handleDownload(row: any) {
    try {
        await downloadFile(row.title, row.fileExt);
    } catch (error) {
        console.error('Download failed:', error);
    }
}

async function editRepo(row: any) {
    await navigateTo({
        path: `/my-data/publish-data/${row.id}`,
    });
}

const deleteConfirmationOpen = ref(false);
const modelForDeletion = ref<any | null>(null);

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
    return languages.find((item: any) => item.id === Number.parseInt(language))?.name;
};

const domain = (domain: any) => {
    return sectors.find((item: any) => item.id === Number.parseInt(domain))?.name;
};

const pageCount = 10;
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <!-- Progress Bar - Fixed at top when downloading -->
        <div v-if="isDownloading" class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-primary-600 animate-bounce" />
                    <div class="flex-1">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-medium text-gray-700">Downloading file...</span>
                            <span class="text-sm font-semibold text-primary-600">{{ progress }}%</span>
                        </div>
                        <UProgress :value="progress" size="sm" color="primary" />
                    </div>
                </div>
            </div>
        </div>

        <UCard v-if="!modelsFetchError">
            <div class="flex justify-between flex-1">
                <div class="flex flex-1">
                    <UInput 
                        v-model="searchString" 
                        size="md" 
                        :placeholder="$t('models.dmRepository.search')"
                        class="w-full" 
                    />
                </div>
            </div>

            <UTable 
                v-model:sort="sortBy" 
                sort-mode="manual" 
                class="mt-8" 
                :columns="columns" 
                :rows="paginatedRows"
                :loading="modelsLoading"
            >
                <template #date-data="{ row }">
                    {{ dayjs(row.updatedAt).format('DD/MM/YYYY') }}
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
                        <UButton 
                            color="gray" 
                            variant="ghost" 
                            icon="i-heroicons-ellipsis-vertical-20-solid"
                            :disabled="isDownloading"
                        />
                    </UDropdown>
                </template>
            </UTable>

            <div v-if="filteredRows?.length > pageCount" class="flex justify-end mt-2">
                <div class="mt-2">
                    <UPagination 
                        v-model="page" 
                        :page-count="pageCount" 
                        :total="filteredRows.length"
                        :active-button="{ variant: 'outline' }" 
                    />
                </div>
            </div>
        </UCard>

        <UModal v-model="deleteConfirmationOpen">
            <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
                <p class="font-bold text-xl">{{ $t('areYouSure') }}</p>
                <p class="text-gray-400 mt-6">{{ $t('models.deleteModelDescription') }}</p>
                <div class="flex gap-8 w-full justify-center mt-6">
                    <UButton 
                        color="white" 
                        class="w-20 flex justify-center"
                        @click="(deleteConfirmationOpen = false), (modelForDeletion = null)"
                    >
                        {{ $t('cancel') }}
                    </UButton>
                    <UButton class="w-20 flex justify-center" @click="deleteRepo()">
                        {{ $t('yes') }}
                    </UButton>
                </div>
            </UCard>
        </UModal>
    </div>
</template>