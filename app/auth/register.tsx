import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    Alert,
    Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { register } from '@/lib/api';
import { setStoredAuth } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react-native';

export default function CreateAccountScreen() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            console.log('Registering user:', formData);
            const response = await register(formData.name, formData.email, formData.password);

            if (response.success) {
                if (response.token && response.user) {
                    await setStoredAuth(response.token, response.user);
                }

                router.push({
                    pathname: '/auth/email-sent',
                    params: { email: formData.email }
                });
            } else {
                Alert.alert('Error', response.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Coming Soon', `${provider} login will be available soon!`);
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                className="flex-1 px-8 pt-24 pb-10"
            >
                <View className="flex-1">
                    {/* Header */}
                    <View className="mb-10">
                        <Text className="text-4xl font-medium text-black leading-11">Create your</Text>
                        <Text className="text-4xl font-medium text-black leading-11">account</Text>
                    </View>

                    {/* Form */}
                    <View className="flex-1">
                        <View className="mb-6">
                            {/* Full Name */}
                            <TextInput
                                className="border-b border-gray-200 pb-3 text-base text-black font-light"
                                placeholder="Full Name"
                                placeholderTextColor="#9ca3af"
                                value={formData.name}
                                onChangeText={(value) => updateFormData('name', value)}
                            />
                        </View>

                        {/* Email Address */}
                        <View className="mb-6">
                            <TextInput
                                className="border-b border-gray-200 pb-3 text-base text-black font-light"
                                placeholder="Email address"
                                placeholderTextColor="#9ca3af"
                                value={formData.email}
                                onChangeText={(value) => updateFormData('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <View className="mb-6">
                            <View className="flex-row items-center border-b border-gray-200">
                                <TextInput
                                    className="flex-1 text-base text-black font-light"
                                    placeholder="Password"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-2 -mr-2">
                                    {showPassword ? (
                                        <Eye size={20} color="#9CA3AF" />
                                    ) : (
                                        <EyeOff size={20} color="#9CA3AF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View className="mb-6">
                            <View className="flex-row items-center border-b border-gray-200">
                                <TextInput
                                    className="flex-1 text-base text-black font-light"
                                    placeholder="Confirm password"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="pr-2 -mr-2">
                                    {showConfirmPassword ? (
                                        <Eye size={20} color="#9CA3AF" />
                                    ) : (
                                        <EyeOff size={20} color="#9CA3AF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            className={`bg-neutral-800 rounded-full h-14 items-center justify-center mt-8 mb-8 ${loading ? 'opacity-60' : ''}`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text className="text-white text-base font-medium tracking-wide">
                                {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                            </Text>
                        </TouchableOpacity>

                        {/* Social Login */}
                        <Text className="text-center text-sm text-gray-400 font-light mb-6">
                            or sign up with
                        </Text>
                        <View className="flex-row justify-center gap-6 mb-16">
                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                                onPress={() => handleSocialLogin('apple')}
                            >
                                <Image source={require('../../assets/images/apple.png')} className="w-6 h-6" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                                onPress={() => handleSocialLogin('google')}
                            >
                                <Image source={require('../../assets/images/google.png')} className="w-6 h-6" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                                onPress={() => handleSocialLogin('facebook')}
                            >
                                <Image source={require('../../assets/images/facebook.png')} className="w-6 h-6" />
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-center items-center mt-auto">
                            <Text className="text-base text-gray-700 font-light">Already have an account? </Text>
                            <Link href="/auth/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-base text-black font-medium underline">Log in</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}