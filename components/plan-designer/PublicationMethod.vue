<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { licenses } from '~/constants/licenses';
import type CardSelection from '~/interfaces/card-selection';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';


const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    publicationDetailsProp: {
        type: Object,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
    },
});

//use computed getter and setter to avoid prop mutation
const publicationDetails = computed({
    get() {
        return props.publicationDetailsProp;
    },
    set(newValue: Partial<publicationType>) {
        emit('update:publication-details-prop', newValue);
    },
});

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
});

const isAllValid = computed(() => true);

const { publicationSchema } = usePublicationSchema();

type publicationType = z.infer<typeof publicationSchema>;

const resetpublication = (publicationType: 'one-off') => {

    publicationDetails.value = {
        // price: 0,
        license: " s",
        // contractTerms: '',
        startDate: '',
        termDate: '',
    };
};

const switchWarningOpen = ref(false);
const publicationToSend = ref();


const emit = defineEmits([
    'update:publication-details-prop',
    'changePage',
    'update:isAllValid',
]);

const formRef = ref();


const handlepublicationClick = (value: string) => {
    switchWarningOpen.value = true;
    publicationToSend.value = value;
};

const customValidate = () => {
    const errors = [];
    emit('update:isAllValid', isAllValid.value);
    //TODO: Somehow get to AssetOfferingDetails component

    // if (publicationDetails.value.price && publicationDetails.value.price < 10) {
    //     errors.push({ path: 'price', message: t('val.price') });
    // }
    if (!publicationDetails.value.termDate)
        errors.push({ path: 'termDate', message: t('val.required') });
    if (!publicationDetails.value.startDate)
        errors.push({ path: 'startDate', message: t('val.required') });


    return errors;
};

const getLicenseName = (licenseId: any) => {
    // Find the license object by id
    const license = licenses.find(item => item.id === licenseId);
    return license?.name;
}
async function onSubmit(): Promise<void> {
    if (isAllValid.value) {
        emit('changePage', 2);
    } else {
        if (!props.assetOfferingDetails?.keywords?.length) {
            showErrorMessage(t('data.designer.pleaseEnterAtLeastOneKeyword'));
        }
        showErrorMessage(t('data.designer.pleaseCheck'));
    }
}
</script>

<template>
    <Transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-300 ease-in" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <UCard>
            <template #header>
                <SubHeading :title="$t('data.designer.monetizationMethod')" />
            </template>
            <div class="space-y-5">
                <Transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0"
                    enter-to-class="opacity-100" leave-active-class="duration-300 ease-in"
                    leave-from-class="opacity-100" leave-to-class="transform opacity-0">
                    <UForm ref="formRef" :key="publicationDetails.type" class="flex flex-col w-full"
                        :state="publicationDetails" :validate="customValidate"
                        :validate-on="['input', 'submit', 'blur', 'change']" @submit="onSubmit">
                        <template v-if="publicationDetails.type === 'one-off'">
                            <div class="flex flex-col space-y-5">
                                <div class="flex flex-row gap-4">
                                    <!-- <div class="flex-1 flex gap-4">
                                        <UFormGroup :label="$t('data.designer.oneOffPrice')" class="flex-1 w-1/4"
                                            name="price">
                                            <UInput v-model.number="publicationDetails.price"
                                                :placeholder="$t('data.designer.oneOffPrice')" type="numeric">
                                                <template #trailing>
                                                    <span class="text-gray-500 text-xs">EUR</span>
                                                </template>
                                            </UInput>
                                        </UFormGroup>
                                    </div> -->
                                    <UFormGroup :label="$t('license')" required name="license"
                                        class="flex-1 text-gray-200 w-1/4">
                                        <USelectMenu v-model="publicationDetails.license" :ui="{
                                            option: { active: 'text-gray-200' },
                                            input: 'placeholder:text-gray-200 text-gray-200',
                                            button: 'text-gray-200'
                                        }" :placeholder="$t('data.designer.selectLicense')" :options="licenses"
                                            option-attribute="name" value-attribute="id">
                                            <template #label>
                                                <span v-if="publicationDetails.license" class="truncate">
                                                    {{
                                                        getLicenseName(publicationDetails.license)
                                                    }}
                                                </span>
                                                <span v-else class="text-gray-400">Select license</span>
                                            </template>
                                        </USelectMenu>
                                    </UFormGroup>

                                    <UFormGroup :label="$t('data.designer.startDate')" name="startDate"
                                        class=" flex-1text-gray-200 ">
                                        <UPopover :popper="{ placement: 'bottom-start' }">
                                            <UButton color="white" icon="i-heroicons-calendar-days-20-solid" :label="publicationDetails.startDate
                                                ? dayjs(publicationDetails.startDate).format(
                                                    'DD MMMM YYYY',
                                                )
                                                : t('data.designer.pleaseSelectDate')
                                                " :class="[
                                                    publicationDetails.startDate
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400',
                                                ]" />
                                            <template #panel="{ close }">
                                                <DatePicker v-model="publicationDetails.startDate" is-required
                                                    @close="close" />
                                            </template>
                                        </UPopover>
                                        <template #error="{ error }">
                                            <span :class="[
                                                error
                                                    ? 'text-red-500 dark:text-red-400'
                                                    : 'text-primary-500 dark:text-primary-400',
                                            ]">
                                                {{ publicationDetails.startDate ? '' : error }}
                                            </span>
                                        </template>
                                    </UFormGroup>
                                    <UFormGroup :label="$t('data.designer.termDate')" name="termDate"
                                        class=" flex-1text-gray-200 ">
                                        <UPopover :popper="{ placement: 'bottom-start' }">
                                            <UButton color="white" icon="i-heroicons-calendar-days-20-solid" :label="publicationDetails.termDate
                                                ? dayjs(publicationDetails.termDate).format(
                                                    'DD MMMM YYYY',
                                                )
                                                : t('data.designer.pleaseSelectDate')
                                                " :class="[
                                                    publicationDetails.termDate
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400',
                                                ]" />
                                            <template #panel="{ close }">
                                                <DatePicker v-model="publicationDetails.termDate" is-required
                                                    @close="close" />
                                            </template>
                                        </UPopover>
                                        <template #error="{ error }">
                                            <span :class="[
                                                error
                                                    ? 'text-red-500 dark:text-red-400'
                                                    : 'text-primary-500 dark:text-primary-400',
                                            ]">
                                                {{ publicationDetails.termDate ? '' : error }}
                                            </span>
                                        </template>
                                    </UFormGroup>

                                </div>
                            </div>
                        </template>
                        <!-- FIXME remove comment when we have the licenses -->
                        <!-- <div v-show="publicationDetails.license">
                            <p class="font-semibold text-sm mt-5 mb-1.5">{{ $t('licenseDetails') }}</p>
                            <DataShareTerms
                                :asset-offering-details="assetOfferingDetails"
                                :publication-details="publicationDetails"
                                @update:contract-terms="(value: string) => updateContractTerms(value)"
                            />
                        </div> -->

                        <div class="w-full flex items-center justify-between mt-4">
                            <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 0)">
                                {{ $t('back') }}
                            </UButton>
                            <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
                        </div>
                    </UForm>
                </Transition>
            </div>
        </UCard>
    </Transition>
    <UModal v-model="switchWarningOpen">
        <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
            <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
            <p class="text-gray-400 mt-6">{{ $t('data.designer.willReset') }}</p>
            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchWarningOpen = false">{{
                    $t('cancel')
                    }}</UButton>
                <UButton class="w-20 flex justify-center" @click="
                    resetpublication(publicationToSend);
                switchWarningOpen = false;
                ">{{ $t('yes') }}</UButton>
            </div>
        </UCard>
    </UModal>
</template>
