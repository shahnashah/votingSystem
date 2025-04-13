import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Link,
  Copy,
  RefreshCw,
  Calendar,
  Share2,
  LinkIcon,
  X,
  Check,
  UserPlus,
  Vote,
  Users,
} from "lucide-react";

const API_BASE_URL = "/api";

const LinkManagement = () => {
  const [elections, setElections] = useState([]);
  const [currentElection, setCurrentElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState({
    registration: false,
    nomination: false,
    voting: false,
  });
  const [copied, setCopied] = useState({
    registration: false,
    nomination: false,
    voting: false,
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/election/committee/elections`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setElections(response.data);

      if (response.data.length > 0) {
        setCurrentElection(response.data[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setLoading(false);
    }
  };

  const handleRegenerate = async (linkType) => {
    if (!currentElection) return;

    try {
      setRegenerating({ ...regenerating, [linkType]: true });

      const response = await axios.post(
        `${API_BASE_URL}/committee/elections/${currentElection._id}/regenerate-link`,
        { linkType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Update the current election with the new link
      setCurrentElection({
        ...currentElection,
        [`${linkType}Link`]: response.data[`${linkType}Link`],
      });

      // Also update the election in the elections array
      const updatedElections = elections.map((election) =>
        election._id === currentElection._id
          ? {
              ...election,
              [`${linkType}Link`]: response.data[`${linkType}Link`],
            }
          : election
      );
      setElections(updatedElections);

      setRegenerating({ ...regenerating, [linkType]: false });
    } catch (error) {
      console.error(`Error regenerating ${linkType} link:`, error);
      setRegenerating({ ...regenerating, [linkType]: false });
    }
  };

  const copyToClipboard = (text, linkType) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [linkType]: true });
      setTimeout(() => {
        setCopied({ ...copied, [linkType]: false });
      }, 2000);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getFullLink = (path) => {
    // In a real application, you would use your domain
    return `${window.location.origin}${path}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Link Management</h1>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading elections...</div>
      ) : elections.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          No elections found. Please create an election first.
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Election
            </label>
            <select
              value={currentElection?._id || ""}
              onChange={(e) => {
                const selected = elections.find(
                  (election) => election._id === e.target.value
                );
                setCurrentElection(selected);
              }}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
            >
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
          </div>

          {currentElection && (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  {currentElection.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>
                    Voting period: {formatDate(currentElection.votingStart)} to{" "}
                    {formatDate(currentElection.votingEnd)}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <LinkCard
                  title="Voter Registration Link"
                  description="Send this link to potential voters to register for the election"
                  link={
                    currentElection.registrationLink
                      ? getFullLink(currentElection.registrationLink)
                      : "Not generated yet"
                  }
                  onRegenerate={() => handleRegenerate("registration")}
                  onCopy={() =>
                    copyToClipboard(
                      getFullLink(currentElection.registrationLink),
                      "registration"
                    )
                  }
                  isRegenerating={regenerating.registration}
                  isCopied={copied.registration}
                  icon="registration"
                />

                <LinkCard
                  title="Nomination Link"
                  description="Send this link to potential candidates to submit their nominations"
                  link={
                    currentElection.nominationLink
                      ? getFullLink(currentElection.nominationLink)
                      : "Not generated yet"
                  }
                  onRegenerate={() => handleRegenerate("nomination")}
                  onCopy={() =>
                    copyToClipboard(
                      getFullLink(currentElection.nominationLink),
                      "nomination"
                    )
                  }
                  isRegenerating={regenerating.nomination}
                  isCopied={copied.nomination}
                  icon="nomination"
                />

                <LinkCard
                  title="Voting Link"
                  description="Send this link to registered voters when voting period begins"
                  link={
                    currentElection.votingLink
                      ? getFullLink(currentElection.votingLink)
                      : "Not generated yet"
                  }
                  onRegenerate={() => handleRegenerate("voting")}
                  onCopy={() =>
                    copyToClipboard(
                      getFullLink(currentElection.votingLink),
                      "voting"
                    )
                  }
                  isRegenerating={regenerating.voting}
                  isCopied={copied.voting}
                  icon="voting"
                />
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notes:
                </h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  <li>
                    Regenerating a link will invalidate the previous link.
                  </li>
                  <li>
                    Make sure to distribute the new links to all participants.
                  </li>
                  <li>
                    Voting links will only work during the set voting period.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const LinkCard = ({
  title,
  description,
  link,
  onRegenerate,
  onCopy,
  isRegenerating,
  isCopied,
  icon,
}) => {
  const getIcon = () => {
    switch (icon) {
      case "registration":
        return <UserPlus size={24} className="text-blue-500" />;
      case "nomination":
        return <Users size={24} className="text-green-500" />;
      case "voting":
        return <Vote size={24} className="text-purple-500" />;
      default:
        return <LinkIcon size={24} className="text-gray-500" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
        <div className="ml-4 flex-grow">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mb-3">{description}</p>

          <div className="flex flex-col sm:flex-row sm:items-center mb-3">
            <div className="flex-grow bg-gray-50 p-2 rounded-md text-sm text-gray-700 mb-2 sm:mb-0 break-all">
              {link}
            </div>
            <div className="flex ml-0 sm:ml-2 space-x-2">
              <button
                onClick={onCopy}
                disabled={link === "Not generated yet"}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm disabled:opacity-50"
              >
                {isCopied ? (
                  <>
                    <Check size={14} className="mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw size={14} className="mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="mr-1" />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Share2 size={12} className="mr-1" />
            <span>Share this link via email or messaging apps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkManagement;
