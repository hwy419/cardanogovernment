'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  CheckCircle,
  Info,
  Github,
  Globe,
  Twitter,
  MessageCircle,
  User,
  FileText,
  Shield,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DREP_FOCUS_AREAS } from '@/types/governance';

// Registration form schema based on CIP-100/108 standards
const drepRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  twitter: z.string().regex(/^@?[\w]+$/, 'Invalid Twitter handle').optional().or(z.literal('')),
  discord: z.string().min(3, 'Discord handle must be at least 3 characters').optional().or(z.literal('')),
  telegram: z.string().regex(/^@?[\w]+$/, 'Invalid Telegram handle').optional().or(z.literal('')),
  manifesto: z.string().min(100, 'Manifesto must be at least 100 characters').max(2000, 'Manifesto must be less than 2000 characters'),
  experience: z.string().min(50, 'Experience description must be at least 50 characters').max(1000, 'Experience description must be less than 1000 characters'),
  focusAreas: z.array(z.enum(['technical', 'governance', 'community', 'education', 'security', 'protocol', 'treasury', 'sustainability']))
    .min(1, 'Please select at least one focus area').max(5, 'Please select no more than 5 focus areas'),
  votingPhilosophy: z.string().min(50, 'Voting philosophy must be at least 50 characters').max(1000, 'Voting philosophy must be less than 1000 characters'),
  qualifications: z.string().max(500, 'Qualifications must be less than 500 characters').optional(),
  motivations: z.string().min(50, 'Motivations must be at least 50 characters').max(500, 'Motivations must be less than 500 characters'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  githubUrl: z.string().url('Please provide a valid GitHub URL for your metadata file').optional(),
});

type DRepRegistrationFormData = z.infer<typeof drepRegistrationSchema>;

export type { DRepRegistrationFormData };

interface DRepRegistrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
  onRegistrationComplete?: (data: DRepRegistrationFormData) => void;
  theme: {
    isDark: boolean;
    bg: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Your name and bio' },
  { id: 'contact', title: 'Contact & Social', description: 'How people can reach you' },
  { id: 'governance', title: 'Governance Profile', description: 'Your manifesto and philosophy' },
  { id: 'experience', title: 'Experience & Motivation', description: 'Your background and goals' },
  { id: 'metadata', title: 'Metadata & Submission', description: 'Generate JSON and submit' },
];

export function DRepRegistrationWizard({
  isOpen,
  onClose,
  walletAddress,
  onRegistrationComplete,
  theme,
}: DRepRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<string>('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const form = useForm<DRepRegistrationFormData>({
    resolver: zodResolver(drepRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      bio: '',
      email: '',
      website: '',
      twitter: '',
      discord: '',
      telegram: '',
      manifesto: '',
      experience: '',
      focusAreas: [],
      votingPhilosophy: '',
      qualifications: '',
      motivations: '',
      acceptTerms: false,
      githubUrl: '',
    },
  });

  const { register, watch, trigger, getValues, formState: { errors } } = form;
  const watchedValues = watch();

  // Generate CIP-100/108 compliant metadata JSON
  const generateMetadataJSON = useCallback((data: DRepRegistrationFormData) => {
    const metadata = {
      '@context': {
        '@language': 'en-us',
        'CIP100': 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
        'CIP119': 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md#',
        'hashAlgorithm': 'CIP100:hashAlgorithm',
        'body': {
          '@id': 'CIP119:body',
          '@context': {
            'references': {
              '@id': 'CIP119:references',
              '@container': '@set',
              '@context': {
                'GovernanceMetadata': 'CIP100:GovernanceMetadataReference',
                'Identity': 'CIP119:IdentityReference',
                'Link': 'CIP119:LinkReference',
                'Other': 'CIP100:OtherReference',
                'label': 'CIP100:reference-label',
                'uri': 'CIP100:reference-uri'
              }
            },
            'paymentAddress': 'CIP119:paymentAddress',
            'givenName': 'CIP119:givenName',
            'image': 'CIP119:image',
            'objectives': 'CIP119:objectives',
            'motivations': 'CIP119:motivations',
            'qualifications': 'CIP119:qualifications',
            'doNotList': 'CIP119:doNotList'
          }
        }
      },
      'authors': [],
      'hashAlgorithm': 'blake2b-256',
      'body': {
        'paymentAddress': walletAddress || '',
        'givenName': data.name,
        'image': {
          '@type': 'ImageObject',
          'contentUrl': '',
          'sha256': ''
        },
        'objectives': data.manifesto,
        'motivations': data.motivations,
        'qualifications': data.qualifications || '',
        'references': [
          ...(data.website ? [{
            '@type': 'Link',
            'label': 'Website',
            'uri': data.website
          }] : []),
          ...(data.twitter ? [{
            '@type': 'Identity',
            'label': 'Twitter',
            'uri': `https://twitter.com/${data.twitter.replace('@', '')}`
          }] : []),
          ...(data.discord ? [{
            '@type': 'Identity',
            'label': 'Discord',
            'uri': data.discord
          }] : []),
          ...(data.telegram ? [{
            '@type': 'Identity',
            'label': 'Telegram',
            'uri': `https://t.me/${data.telegram.replace('@', '')}`
          }] : []),
        ],
        'doNotList': false,
        'bio': data.bio,
        'experience': data.experience,
        'votingPhilosophy': data.votingPhilosophy,
        'focusAreas': data.focusAreas,
        'email': data.email || undefined,
      }
    };

    return JSON.stringify(metadata, null, 2);
  }, [walletAddress]);

  // Validate current step
  const validateCurrentStep = async () => {
    const stepFields: Record<number, (keyof DRepRegistrationFormData)[]> = {
      0: ['name', 'bio'],
      1: ['email', 'website', 'twitter', 'discord', 'telegram'],
      2: ['manifesto', 'experience', 'focusAreas', 'votingPhilosophy'],
      3: ['qualifications', 'motivations'],
      4: ['acceptTerms'],
    };

    const fieldsToValidate = stepFields[currentStep];
    if (fieldsToValidate) {
      return await trigger(fieldsToValidate);
    }
    return true;
  };

  // Navigation handlers
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate metadata when reaching final step
  useEffect(() => {
    if (currentStep === STEPS.length - 1) {
      const formData = getValues();
      const json = generateMetadataJSON(formData);
      setGeneratedMetadata(json);
    }
  }, [currentStep, watchedValues, getValues, generateMetadataJSON]);

  // Submit handlers
  const handleCopyJson = () => {
    navigator.clipboard.writeText(generatedMetadata);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([generatedMetadata], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drep-metadata-${walletAddress?.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (data: DRepRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onRegistrationComplete?.(data);
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={cn(
        'max-w-4xl max-h-[90vh] w-full rounded-lg shadow-xl overflow-hidden',
        theme.cardBg, theme.border, 'border'
      )}>
        {/* Header */}
        <div className={cn('px-6 py-4 border-b', theme.border)}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5" />
            <h2 className={cn('text-xl font-bold', theme.text)}>Register as DRep</h2>
          </div>
          <p className={cn('text-sm', theme.textSecondary)}>
            Complete your DRep registration to start participating in Cardano governance
          </p>
        </div>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                  index < currentStep && 'cursor-pointer hover:bg-primary/80'
                )}
                disabled={index > currentStep}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className={cn('text-sm font-medium', theme.text)}>
              {STEPS[currentStep]?.title}
            </span>
            <span className={cn('text-sm', theme.textSecondary)}>
              {currentStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className={cn('block text-sm font-medium', theme.text)}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    id="name"
                    placeholder="Enter your full name"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                      theme.cardBg, theme.border, theme.text,
                      errors.name && 'border-red-500'
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className={cn('block text-sm font-medium', theme.text)}>
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    placeholder="Tell us about yourself and your involvement in the Cardano ecosystem..."
                    rows={4}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text,
                      errors.bio && 'border-red-500'
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.bio ? (
                      <span className="text-red-500">{errors.bio.message}</span>
                    ) : (
                      <span className={theme.textSecondary}>Minimum 50 characters</span>
                    )}
                    <span className={theme.textSecondary}>
                      {watchedValues.bio?.length || 0}/500
                    </span>
                  </div>
                </div>

                <div className={cn('p-4 rounded-lg border-l-4 border-blue-500', theme.cardBg)}>
                  <div className="flex">
                    <Info className="w-5 h-5 text-blue-500 mr-2" />
                    <p className={cn('text-sm', theme.textSecondary)}>
                      This information will be publicly visible on your DRep profile. Make sure to provide 
                      accurate details that help voters understand who you are.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Contact & Social */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className={cn('block text-sm font-medium', theme.text)}>
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                      theme.cardBg, theme.border, theme.text,
                      errors.email && 'border-red-500'
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className={cn('block text-sm font-medium', theme.text)}>
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('website')}
                      id="website"
                      placeholder="https://your-website.com"
                      className={cn(
                        'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                        theme.cardBg, theme.border, theme.text,
                        errors.website && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website.message}</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className={cn('font-medium mb-4', theme.text)}>Social Media Profiles</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="twitter" className={cn('block text-sm font-medium', theme.text)}>
                        Twitter Handle
                      </label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('twitter')}
                          id="twitter"
                          placeholder="@yourusername"
                          className={cn(
                            'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                            theme.cardBg, theme.border, theme.text,
                            errors.twitter && 'border-red-500'
                          )}
                        />
                      </div>
                      {errors.twitter && (
                        <p className="text-sm text-red-500">{errors.twitter.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="discord" className={cn('block text-sm font-medium', theme.text)}>
                        Discord Handle
                      </label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('discord')}
                          id="discord"
                          placeholder="yourusername#1234"
                          className={cn(
                            'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                            theme.cardBg, theme.border, theme.text,
                            errors.discord && 'border-red-500'
                          )}
                        />
                      </div>
                      {errors.discord && (
                        <p className="text-sm text-red-500">{errors.discord.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="telegram" className={cn('block text-sm font-medium', theme.text)}>
                        Telegram Handle
                      </label>
                      <input
                        {...register('telegram')}
                        id="telegram"
                        placeholder="@yourusername"
                        className={cn(
                          'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                          theme.cardBg, theme.border, theme.text,
                          errors.telegram && 'border-red-500'
                        )}
                      />
                      {errors.telegram && (
                        <p className="text-sm text-red-500">{errors.telegram.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Governance Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="manifesto" className={cn('block text-sm font-medium', theme.text)}>
                    Manifesto <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('manifesto')}
                    id="manifesto"
                    placeholder="Describe your vision for Cardano's governance, your key principles, and what you stand for..."
                    rows={6}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text,
                      errors.manifesto && 'border-red-500'
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.manifesto ? (
                      <span className="text-red-500">{errors.manifesto.message}</span>
                    ) : (
                      <span className={theme.textSecondary}>Minimum 100 characters</span>
                    )}
                    <span className={theme.textSecondary}>
                      {watchedValues.manifesto?.length || 0}/2000
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn('block text-sm font-medium', theme.text)}>
                    Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DREP_FOCUS_AREAS.map((area) => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          {...register('focusAreas')}
                          type="checkbox"
                          value={area}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className={cn('text-sm capitalize', theme.text)}>{area}</span>
                      </label>
                    ))}
                  </div>
                  {errors.focusAreas && (
                    <p className="text-sm text-red-500">{errors.focusAreas.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="votingPhilosophy" className={cn('block text-sm font-medium', theme.text)}>
                    Voting Philosophy <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('votingPhilosophy')}
                    id="votingPhilosophy"
                    placeholder="Explain your approach to voting on governance proposals..."
                    rows={4}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text,
                      errors.votingPhilosophy && 'border-red-500'
                    )}
                  />
                  {errors.votingPhilosophy && (
                    <p className="text-sm text-red-500">{errors.votingPhilosophy.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Experience & Motivation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="experience" className={cn('block text-sm font-medium', theme.text)}>
                    Experience & Background <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('experience')}
                    id="experience"
                    placeholder="Describe your relevant experience in blockchain, governance, or related fields..."
                    rows={4}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text,
                      errors.experience && 'border-red-500'
                    )}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">{errors.experience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="qualifications" className={cn('block text-sm font-medium', theme.text)}>
                    Qualifications & Credentials
                  </label>
                  <textarea
                    {...register('qualifications')}
                    id="qualifications"
                    placeholder="List any relevant qualifications, certifications, or credentials (optional)..."
                    rows={3}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="motivations" className={cn('block text-sm font-medium', theme.text)}>
                    Motivations <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('motivations')}
                    id="motivations"
                    placeholder="What motivates you to become a DRep? What do you hope to achieve for the Cardano ecosystem?"
                    rows={4}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none',
                      theme.cardBg, theme.border, theme.text,
                      errors.motivations && 'border-red-500'
                    )}
                  />
                  {errors.motivations && (
                    <p className="text-sm text-red-500">{errors.motivations.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Metadata & Submission */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className={cn('p-4 rounded-lg border-l-4 border-blue-500', theme.cardBg)}>
                  <div className="flex">
                    <Info className="w-5 h-5 text-blue-500 mr-2" />
                    <p className={cn('text-sm', theme.textSecondary)}>
                      We&apos;ll generate a CIP-100/108 compliant JSON metadata file containing all your information. 
                      You&apos;ll need to upload this to your GitHub account and provide the public URL.
                    </p>
                  </div>
                </div>

                {generatedMetadata && (
                  <div className={cn('p-4 rounded-lg border', theme.cardBg, theme.border)}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5" />
                      <h4 className={cn('font-medium', theme.text)}>Generated Metadata</h4>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="btn-primary flex items-center gap-2 flex-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copy JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="btn-primary flex items-center gap-2 flex-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowJsonPreview(!showJsonPreview)}
                        className="btn-outline"
                      >
                        {showJsonPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {showJsonPreview && (
                      <pre className={cn(
                        'p-4 rounded-md text-xs overflow-auto max-h-60 border',
                        'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {generatedMetadata}
                      </pre>
                    )}
                  </div>
                )}

                <div className={cn('p-4 rounded-lg border', theme.cardBg, theme.border)}>
                  <div className="flex items-center gap-2 mb-4">
                    <Github className="w-5 h-5" />
                    <h4 className={cn('font-medium', theme.text)}>GitHub Upload Instructions</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">1</span>
                      <p className={theme.textSecondary}>Copy or download the generated JSON metadata file</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">2</span>
                      <p className={theme.textSecondary}>Create a new file in your GitHub repository (e.g., drep-metadata.json)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">3</span>
                      <p className={theme.textSecondary}>Paste the JSON content and commit the file</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">4</span>
                      <p className={theme.textSecondary}>Copy the raw file URL (click &quot;Raw&quot; button on GitHub)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">5</span>
                      <p className={theme.textSecondary}>Paste the URL in the field below</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="githubUrl" className={cn('block text-sm font-medium', theme.text)}>
                    GitHub Metadata URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('githubUrl')}
                      id="githubUrl"
                      placeholder="https://raw.githubusercontent.com/username/repo/main/drep-metadata.json"
                      className={cn(
                        'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary',
                        theme.cardBg, theme.border, theme.text,
                        errors.githubUrl && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.githubUrl && (
                    <p className="text-sm text-red-500">{errors.githubUrl.message}</p>
                  )}
                  <p className={cn('text-sm', theme.textSecondary)}>
                    This URL will be used in your DRep registration transaction
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('acceptTerms')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className={cn('text-sm', theme.text)}>
                      I accept the terms and conditions and understand my responsibilities as a DRep{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                  )}
                </div>

                <div className={cn('p-4 rounded-lg border-l-4 border-yellow-500', theme.cardBg)}>
                  <div className="flex">
                    <Shield className="w-5 h-5 text-yellow-500 mr-2" />
                    <p className={cn('text-sm', theme.textSecondary)}>
                      By registering as a DRep, you commit to actively participate in governance voting 
                      and act in the best interests of your delegators and the Cardano ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className={cn('px-6 py-4 border-t flex justify-between', theme.border)}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={cn(
              'btn-outline flex items-center gap-2',
              currentStep === 0 && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            
            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => handleSubmit(getValues())}
                disabled={!form.formState.isValid || isSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}