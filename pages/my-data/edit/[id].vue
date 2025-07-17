<script setup lang="ts">
import { ref } from 'vue';
import {sectors, languages} from '~/interfaces/'
import { v4 as uuidV4 } from 'uuid';

const router = useRouter();
const { data: session } = useAuth();
const isDragging = ref<boolean>(false);
const file = ref();
const uploaded = ref();
const isValidFile = ref<boolean>(false);
const route = useRoute();
const assetId = route.params.id;

const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const { t } = useI18n();

const { data: dataset, status: datasetsStatus } = await useFetch<any>('/api/datasets/get-specific', { query: { id: assetId } });
// const { dataModelSchema, modelTypes } = useModelSchema(true);

let dataModelState = ref<any>({
    assetId: dataset.value?.assetId,
    title: dataset.value?.title,
    version: dataset.value?.version,
    description: dataset.value?.description,
    data: '',
    domain: Number.parseInt(dataset.value?.domain) ,
    keywords: dataset.value?.keywords.flatMap(item => item.split(',')),
    language: Number.parseInt(dataset.value?.language),
    publisher:session.value?.user?.sub, //TODO change to retrieve from user in backend
    published: false,
    type:dataset.value?.language
});

function onChange() {
    uploaded.value = file.value.files[0];

    if (uploaded.value?.name.length) {
        isValidFile.value = true;
        dataModelState.value.data = uploaded.value;
        uploadForm.value.clear('data');
    } else {
        isValidFile.value = false;
        uploaded.value = null;
        file.value = null;
        dataModelState.value.data = null;
        uploadForm.value.setErrors([{ message: t('models.errors.validFile'), path: 'data' }]);
    }
}

watch(dataset, () => {
    if (!dataset.value) return;
        dataModelState = ref<any>({
        assetId: dataset.value?.assetId,
        title: dataset.value?.title,
        version: dataset.value?.version,
        description: dataset.value?.description,
        data: '',
        domain: dataset.value?.domain ,
        keywords: dataset.value?.keywords,
        language: dataset.value?.language,
        publisher:session.value?.user?.sub, //TODO change to retrieve from user in backend
        published: false,
        type:dataset.value?.language
    });
});

function dragover(e: Event) {
    e.preventDefault();
    isDragging.value = true;
}

function dragleave() {
    isDragging.value = false;
}

function drop(e: any) {
    e.preventDefault();
    file.value = e.dataTransfer;
    onChange();
    isDragging.value = false;
}

const pendingUpload = ref(false);

const body = computed(() => {
    const formData = new FormData();

    formData.append('data', uploaded.value);
    formData.append('title', dataModelState.value.title.toString());
    formData.append('description', dataModelState.value.description.toString());
    formData.append('domain', dataModelState.value.domain);
    formData.append('keywords', dataModelState.value.keywords.toString());
    formData.append('language', dataModelState.value.language);
    formData.append('publisher', dataModelState.value.publisher);
    formData.append('published', dataModelState.value.published);
    formData.append('assetId', dataModelState.value.assetId)
    // formData.append('type', uploaded.value.type)
    return formData;
});

const uploadForm = ref();

// const isFormValid = computed(() => {
//     return dataModelSchema.safeParse(dataModelState.value).success;
// });

const uploadFile = async () => {
    const formData = new FormData();

    formData.append('data', uploaded.value);
    formData.append('title', dataModelState.value.title.toString());
    formData.append('description', dataModelState.value.description.toString());
    formData.append('domain', dataModelState.value.domain);
    formData.append('keywords', dataModelState.value.keywords.toString());
    formData.append('language', dataModelState.value.language);
    formData.append('publisher', dataModelState.value.publisher);
    formData.append('published', dataModelState.value.published);
    formData.append('assetId', dataModelState.value.assetId);
    if(uploaded.value) {
        formData.append('data', uploaded.value);
        formData.append('type', uploaded.value.type);
    }
    
    try {
        await $fetch('/api/datasets/update-data', {
            method: 'POST',
            query: {
                id: dataset.value?.assetId,
            },
            body: formData,
        });
        await delay(3);
        router.push({ name: 'home' });
        showSuccessMessage(t('models.successUpload'));
    } catch (error) {
        showErrorMessage(t('models.errors.upload'));
    } finally {
        pendingUpload.value = false;
    }
};

</script>


<template>
    <div class="w-full h-full space-y-6">
        <UCard class="flex flex-col">
            <div class="w-full">
                <UForm ref="uploadForm" :state="dataModelState" class="space-y-5">
                    <UFormGroup :label="$t('models.dmRepository.select') + ':'" name="data" required>
                        <div class="">
                            <div
                                class="flex justify-center rounded-md border-2 border-dashed border-gray-300 py-5"
                                @dragover="dragover"
                                @dragleave="dragleave"
                                @drop="drop"
                            >
                                <div class="text-center flex flex-col items-center space-y-2">
                                    <label
                                        for="data"
                                        class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <UIcon class="box-content h-8 w-8" name="i-heroicons-arrow-up-circle-solid" />
                                    </label>
                                    <div class="flex text-sm text-gray-600 space-x-1">
                                        <label
                                            for="data"
                                            class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                            <span v-if="!isDragging">{{ $t('models.dmRepository.select') }}</span>
                                            <input
                                                id="data"
                                                ref="file"
                                                name="data"
                                                type="file"
                                                class="sr-only"
                                                @change="onChange"
                                            />
                                        </label>
                                        <p v-if="!isDragging" class="">{{ $t('models.dmRepository.drag') }}</p>
                                    </div>
                                    <p v-if="!uploaded" class="text-xs text-gray-500">
                                        {{ $t('models.dmRepository.noFile') }}
                                    </p>
                                    <p v-if="uploaded && isValidFile" class="text-xs text-gray-900">
                                        {{ $t('models.dmRepository.fileName') }} {{ uploaded.name }}
                                    </p>
                                    <p v-if="uploaded && !isValidFile" class="text-xs text-red-500">
                                        {{ $t('models.dmRepository.invalid') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </UFormGroup>
                    <div class="flex flex-col">
                        <div class="flex-row w-full">
                            <UFormGroup
                            class=""
                            :label="$t('models.dmRepository.formTitle')"
                            required
                            name="title"
                            eager-validation
                        >
                            <UInput v-model="dataModelState.title" />
                        </UFormGroup>
                        <UFormGroup
                            class="mt-4"
                            :label="$t('models.dmRepository.domain')"
                            required
                            name="domain"
                            eager-validation
                        >
                            <USelectMenu
                                v-model="dataModelState.domain"
                                :options="sectors"
                                option-attribute="name"
                                value-attribute="id"
                            />
                        </UFormGroup>
                        <UFormGroup
                            class="mt-4"
                            :label="$t('models.dmRepository.language')"
                            required
                            name="language"
                            eager-validation
                        >
                            <USelectMenu
                                v-model="dataModelState.language"
                                :options="languages"
                                option-attribute="name"
                                value-attribute="id"
                            />
                        </UFormGroup>
                        </div>
                        <div class="flex-row flex-1 w-full">
                            <UFormGroup class="mt-4"
                            :label="$t('models.dmRepository.keywords')"
                            required
                            name="keywords"
                            eager-validation>
                            
                            <vue3-tags-input
                                :tags="dataModelState.keywords"
                                :placeholder="dataModelState.keywords ? '' : $t('data.designer.keywordsOfAsset')"
                                @on-tags-changed="(value: string[]) => dataModelState.keywords = value"
                            />
                        </UFormGroup>
                        </div>
                        
                    </div>
                    <UFormGroup
                        :label="$t('models.dmRepository.formDescription')"
                        required
                        name="description"
                        eager-validation
                    >
                        <UTextarea v-model="dataModelState.description" :rows="4" />
                    </UFormGroup>
                    <div class="flex flex-1">
                        
                        
                    </div>
                    <div class="flex justify-end flex-1">
                        <UButton
                            size="md"
                            color="primary"
                            variant="solid"
                            type="submit"
                            :label="$t('data.dmRepository.updateButton')"
                            :disabled="pendingUpload"
                            @click="uploadFile"
                        />
                    </div>
                </UForm>
            </div>
        </UCard>
    </div>
</template>

<style lang="css">
.v3ti .v3ti-tag {
    @apply bg-primary-500 h-[26px] align-middle;
}

.v3ti-new-tag {
    @apply text-sm text-gray-700 h-[30px] focus:ring-0 placeholder-gray-400 align-middle;
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    @apply text-primary-100;
}

.v3ti {
    @apply border-none focus-within:border-none ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 rounded-md h-[20px] align-middle;
}

.v3ti-content {
    focus: border-primary-500 align-baseline;
}
</style>