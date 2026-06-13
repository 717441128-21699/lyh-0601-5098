import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Image,
  Button,
  Textarea,
  ScrollView,
  Picker
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import {
  Pet,
  BehaviorProblem,
  BehaviorProblemType,
  BehaviorProblemTypeLabels
} from '@/types';
import Tag from '@/components/Tag';
import { petApi } from '@/services/api';
import { mockPets } from '@/data';

const severityOptions = [
  { value: 'mild', label: '轻微' },
  { value: 'moderate', label: '中等' },
  { value: 'severe', label: '严重' }
];

const problemTypeOptions = Object.entries(BehaviorProblemTypeLabels).map(
  ([value, label]) => ({ value, label })
);

const PetAddPage: React.FC = () => {
  const router = useRouter();
  const isEdit = !!router.params.id;

  const [formData, setFormData] = useState<Partial<Pet>>({
    name: '',
    breed: '',
    age: 1,
    ageUnit: 'year',
    gender: 'male',
    weight: undefined,
    avatar: '',
    behaviorProblems: [],
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && router.params.id) {
      loadPetForEdit(router.params.id);
    }
  }, [isEdit, router.params.id]);

  const loadPetForEdit = async (id: string) => {
    try {
      const pet = await petApi.getPetById(id);
      setFormData(pet);
      Taro.setNavigationBarTitle({ title: '编辑宠物' });
    } catch (error) {
      console.error('[PetAddPage] loadPetForEdit error:', error);
      const fallback = mockPets.find((p) => p.id === id);
      if (fallback) {
        setFormData(fallback);
        Taro.setNavigationBarTitle({ title: '编辑宠物' });
      }
    }
  };

  const handleAvatarSelect = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      if (res.tempFilePaths.length > 0) {
        setFormData({ ...formData, avatar: res.tempFilePaths[0] });
      }
    } catch (error) {
      console.error('[PetAddPage] handleAvatarSelect error:', error);
    }
  };

  const handleAddProblem = () => {
    const newProblem: BehaviorProblem = {
      id: `bp-${Date.now()}`,
      type: 'other',
      severity: 'mild',
      description: '',
      duration: ''
    };
    setFormData({
      ...formData,
      behaviorProblems: [...(formData.behaviorProblems || []), newProblem]
    });
  };

  const handleRemoveProblem = (index: number) => {
    const problems = [...(formData.behaviorProblems || [])];
    problems.splice(index, 1);
    setFormData({ ...formData, behaviorProblems: problems });
  };

  const handleProblemChange = (
    index: number,
    field: keyof BehaviorProblem,
    value: any
  ) => {
    const problems = [...(formData.behaviorProblems || [])];
    problems[index] = { ...problems[index], [field]: value };
    setFormData({ ...formData, behaviorProblems: problems });
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      Taro.showToast({ title: '请输入宠物名称', icon: 'none' });
      return;
    }
    if (!formData.breed?.trim()) {
      Taro.showToast({ title: '请输入品种', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && router.params.id) {
        await petApi.updatePet(router.params.id, formData);
        Taro.showToast({ title: '修改成功', icon: 'success' });
      } else {
        if (!formData.avatar) {
          formData.avatar = 'https://picsum.photos/id/237/200/200';
        }
        await petApi.createPet(formData as Pet);
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }
      setTimeout(() => Taro.navigateBack(), 1000);
    } catch (error) {
      console.error('[PetAddPage] handleSubmit error:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基础信息</Text>
        <View className={styles.formCard}>
          <View className={styles.avatarSection}>
            <Text className={styles.avatarLabel}>
              <Text className={styles.required}>*</Text>头像
            </Text>
            <View className={styles.avatarWrap} onClick={handleAvatarSelect}>
              {formData.avatar ? (
                <Image
                  className={styles.avatarImage}
                  src={formData.avatar}
                  mode="aspectFill"
                  onError={(e) => {
                    console.error('[PetAddPage] Avatar error:', e.detail);
                  }}
                />
              ) : (
                <Text className={styles.avatarPlaceholder}>📷</Text>
              )}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>名称
            </Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="请输入宠物名称"
                value={formData.name}
                onInput={(e) =>
                  setFormData({ ...formData, name: e.detail.value })
                }
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>品种
            </Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="如：金毛、布偶猫"
                value={formData.breed}
                onInput={(e) =>
                  setFormData({ ...formData, breed: e.detail.value })
                }
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>性别
            </Text>
            <View className={styles.genderSelector}>
              <View
                className={`${styles.genderOption} ${
                  formData.gender === 'male' ? styles.active : ''
                }`}
                onClick={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Text className={styles.genderText}>♂ 公</Text>
              </View>
              <View
                className={`${styles.genderOption} ${
                  formData.gender === 'female' ? styles.active : ''
                }`}
                onClick={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Text className={styles.genderText}>♀ 母</Text>
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>年龄
            </Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入年龄"
                value={String(formData.age)}
                onInput={(e) =>
                  setFormData({
                    ...formData,
                    age: Number(e.detail.value) || 0
                  })
                }
              />
              <View className={styles.unitSelector}>
                <View
                  className={`${styles.unitOption} ${
                    formData.ageUnit === 'year' ? styles.active : ''
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, ageUnit: 'year' })
                  }
                >
                  岁
                </View>
                <View
                  className={`${styles.unitOption} ${
                    formData.ageUnit === 'month' ? styles.active : ''
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, ageUnit: 'month' })
                  }
                >
                  个月
                </View>
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>体重</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入体重（kg）"
                value={formData.weight ? String(formData.weight) : ''}
                onInput={(e) =>
                  setFormData({
                    ...formData,
                    weight: Number(e.detail.value) || undefined
                  })
                }
              />
              <Text style={{ color: '#999', fontSize: 24 }}>kg</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>行为问题</Text>
        <View className={styles.formCard}>
          <View className={styles.problemList}>
            {(formData.behaviorProblems || []).map((problem, index) => (
              <View key={problem.id} className={styles.problemItem}>
                <View className={styles.problemContent}>
                  <View className={styles.problemRow}>
                    <Picker
                      mode="selector"
                      range={problemTypeOptions.map((o) => o.label)}
                      value={problemTypeOptions.findIndex(
                        (o) => o.value === problem.type
                      )}
                      onChange={(e) =>
                        handleProblemChange(
                          index,
                          'type',
                          problemTypeOptions[e.detail.value].value
                        )
                      }
                    >
                      <Text className={styles.problemType}>
                        {BehaviorProblemTypeLabels[problem.type]}
                      </Text>
                    </Picker>
                    <Text
                      className={styles.removeBtn}
                      onClick={() => handleRemoveProblem(index)}
                    >
                      ✕
                    </Text>
                  </View>
                  <View style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <Picker
                      mode="selector"
                      range={severityOptions.map((o) => o.label)}
                      value={severityOptions.findIndex(
                        (o) => o.value === problem.severity
                      )}
                      onChange={(e) =>
                        handleProblemChange(
                          index,
                          'severity',
                          severityOptions[e.detail.value].value
                        )
                      }
                    >
                      <Tag
                        text={severityOptions.find(
                          (o) => o.value === problem.severity
                        )?.label || ''}
                        type={
                          problem.severity === 'severe'
                            ? 'error'
                            : problem.severity === 'moderate'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </Picker>
                    <Input
                      placeholder="持续时间"
                      style={{
                        flex: 1,
                        padding: '8rpx 16rpx',
                        background: '#f5f5f5',
                        borderRadius: 8,
                        fontSize: 24
                      }}
                      value={problem.duration}
                      onInput={(e) =>
                        handleProblemChange(index, 'duration', e.detail.value)
                      }
                    />
                  </View>
                  <Textarea
                    className={styles.textarea}
                    placeholder="请详细描述行为问题表现..."
                    value={problem.description}
                    onInput={(e) =>
                      handleProblemChange(index, 'description', e.detail.value)
                    }
                  />
                </View>
              </View>
            ))}
          </View>
          <Button
            className={styles.addProblemBtn}
            onClick={handleAddProblem}
          >
            <Text>+ 添加行为问题</Text>
          </Button>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>其他说明</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem} style={{ alignItems: 'flex-start' }}>
            <Text className={styles.label}>备注</Text>
            <View className={styles.textareaWrap}>
              <Textarea
                className={styles.textarea}
                placeholder="宠物的性格、喜好、病史等其他需要说明的情况..."
                value={formData.description}
                onInput={(e) =>
                  setFormData({ ...formData, description: e.detail.value })
                }
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.actionBar}>
        <Button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : isEdit ? '保存修改' : '创建档案'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default PetAddPage;
