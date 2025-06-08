'use client';

import React from 'react';
import { GovernanceAction, VoteBreakdown as VoteBreakdownType } from '../../types/voting';

interface VoteBreakdownProps {
  proposal: GovernanceAction;
  className?: string;
  showDetails?: boolean;
  realTimeUpdates?: boolean;
}

interface VoterGroupBreakdownProps {
  title: string;
  votes: { yes: number; no: number; abstain: number };
  threshold: number;
  votingPower: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Individual voter group breakdown component
function VoterGroupBreakdown({ 
  title, 
  votes, 
  threshold, 
  votingPower, 
  icon, 
  color, 
  description 
}: VoterGroupBreakdownProps) {
  const total = votes.yes + votes.no + votes.abstain;
  const participation = total > 0 ? (total / votingPower) * 100 : 0;
  
  // Calculate percentages
  const yesPercentage = total > 0 ? (votes.yes / total) * 100 : 0;
  const noPercentage = total > 0 ? (votes.no / total) * 100 : 0;
  const abstainPercentage = total > 0 ? (votes.abstain / total) * 100 : 0;
  
  // Check if threshold is met
  const thresholdMet = yesPercentage >= threshold;
  
  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Participation</div>
          <div className="font-medium">{participation.toFixed(1)}%</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {/* Yes Votes */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-700 font-medium">Yes</span>
            <span className="text-gray-600">
              {votes.yes.toLocaleString()} ({yesPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${yesPercentage}%` }}
              role="progressbar"
              aria-valuenow={yesPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Yes votes: ${yesPercentage.toFixed(1)}%`}
            />
            {/* Threshold line for Yes votes */}
            {threshold > 0 && (
              <div 
                className="absolute top-0 h-3 w-0.5 bg-black opacity-50"
                style={{ left: `${threshold}%` }}
                title={`Threshold: ${threshold}%`}
              />
            )}
          </div>
        </div>

        {/* No Votes */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-700 font-medium">No</span>
            <span className="text-gray-600">
              {votes.no.toLocaleString()} ({noPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${noPercentage}%` }}
              role="progressbar"
              aria-valuenow={noPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`No votes: ${noPercentage.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Abstain Votes */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">Abstain</span>
            <span className="text-gray-600">
              {votes.abstain.toLocaleString()} ({abstainPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gray-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${abstainPercentage}%` }}
              role="progressbar"
              aria-valuenow={abstainPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Abstain votes: ${abstainPercentage.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Threshold Status */}
      <div className={`text-sm p-2 rounded ${
        thresholdMet 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-amber-100 text-amber-800 border border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <span>
            {thresholdMet ? '✓' : '⚠'} Threshold: {threshold}%
          </span>
          <span className="font-medium">
            {thresholdMet ? 'Met' : 'Not Met'}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Total Votes</div>
          <div className="font-medium">{total.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Voting Power</div>
          <div className="font-medium">{votingPower.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// Main vote breakdown component
export function VoteBreakdown({ 
  proposal, 
  className = '', 
  showDetails = true,
  realTimeUpdates = true 
}: VoteBreakdownProps) {
  // Calculate total voting power (this would come from blockchain data)
  const calculateVotingPower = () => {
    // This is mock data - in real implementation, this would come from API
    return {
      drep: 1000000000, // 1B ADA equivalent
      spo: 500000000,   // 500M ADA equivalent
      cc: 7             // 7 council members
    };
  };

  const votingPower = calculateVotingPower();

  // Determine overall proposal status
  const getOverallStatus = () => {
    const drepThresholdMet = (proposal.votes.drep.yes / (proposal.votes.drep.yes + proposal.votes.drep.no + proposal.votes.drep.abstain)) * 100 >= proposal.thresholds.drepThreshold;
    const spoThresholdMet = (proposal.votes.spo.yes / (proposal.votes.spo.yes + proposal.votes.spo.no + proposal.votes.spo.abstain)) * 100 >= proposal.thresholds.spoThreshold;
    const ccThresholdMet = (proposal.votes.constitutionalCouncil.yes / (proposal.votes.constitutionalCouncil.yes + proposal.votes.constitutionalCouncil.no + proposal.votes.constitutionalCouncil.abstain)) * 100 >= proposal.thresholds.ccThreshold;

    if (drepThresholdMet && spoThresholdMet && ccThresholdMet) {
      return { status: 'passing', message: 'All thresholds met - proposal is passing' };
    } else if (!drepThresholdMet || !spoThresholdMet || !ccThresholdMet) {
      return { status: 'failing', message: 'Some thresholds not met - proposal may fail' };
    } else {
      return { status: 'pending', message: 'Voting in progress' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Status Header */}
      <div className={`p-4 rounded-lg border-2 ${
        overallStatus.status === 'passing' 
          ? 'border-green-300 bg-green-50' 
          : overallStatus.status === 'failing'
          ? 'border-red-300 bg-red-50'
          : 'border-blue-300 bg-blue-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Vote Results</h2>
            <p className={`text-sm ${
              overallStatus.status === 'passing' 
                ? 'text-green-700' 
                : overallStatus.status === 'failing'
                ? 'text-red-700'
                : 'text-blue-700'
            }`}>
              {overallStatus.message}
            </p>
          </div>
          {realTimeUpdates && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Updates
            </div>
          )}
        </div>
      </div>

      {/* Tricameral Voting Results */}
      <div className="grid gap-6">
        {/* DRep Votes */}
        <VoterGroupBreakdown
          title="DRep Votes"
          votes={proposal.votes.drep}
          threshold={proposal.thresholds.drepThreshold}
          votingPower={votingPower.drep}
          icon={
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">D</span>
            </div>
          }
          color="blue"
          description="Delegate Representatives voting on behalf of delegated stake"
        />

        {/* SPO Votes */}
        <VoterGroupBreakdown
          title="SPO Votes"
          votes={proposal.votes.spo}
          threshold={proposal.thresholds.spoThreshold}
          votingPower={votingPower.spo}
          icon={
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">S</span>
            </div>
          }
          color="purple"
          description="Stake Pool Operators voting with their stake"
        />

        {/* Constitutional Council Votes */}
        <VoterGroupBreakdown
          title="Constitutional Council"
          votes={proposal.votes.constitutionalCouncil}
          threshold={proposal.thresholds.ccThreshold}
          votingPower={votingPower.cc}
          icon={
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 font-bold text-sm">C</span>
            </div>
          }
          color="amber"
          description="Constitutional Council members ensuring constitutional compliance"
        />
      </div>

      {/* Voting Summary */}
      {showDetails && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Voting Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-bold text-lg">
                {(proposal.votes.drep.yes + proposal.votes.spo.yes + proposal.votes.constitutionalCouncil.yes).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Yes</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-bold text-lg">
                {(proposal.votes.drep.no + proposal.votes.spo.no + proposal.votes.constitutionalCouncil.no).toLocaleString()}
              </div>
              <div className="text-gray-600">Total No</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 font-bold text-lg">
                {(proposal.votes.drep.abstain + proposal.votes.spo.abstain + proposal.votes.constitutionalCouncil.abstain).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Abstain</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-bold text-lg">
                {(
                  proposal.votes.drep.yes + proposal.votes.drep.no + proposal.votes.drep.abstain +
                  proposal.votes.spo.yes + proposal.votes.spo.no + proposal.votes.spo.abstain +
                  proposal.votes.constitutionalCouncil.yes + proposal.votes.constitutionalCouncil.no + proposal.votes.constitutionalCouncil.abstain
                ).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Votes</div>
            </div>
          </div>
        </div>
      )}

      {/* Governance Info */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <p>
          * Cardano uses a tricameral governance system where proposals must meet thresholds 
          across DReps, SPOs, and Constitutional Council to pass.
        </p>
        {realTimeUpdates && (
          <p className="mt-1">
            Results update in real-time as votes are submitted to the blockchain.
          </p>
        )}
      </div>
    </div>
  );
}