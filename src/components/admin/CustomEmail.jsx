import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Popper,
  ClickAwayListener,
  Fade,
  ListItemButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  MusicNote as MusicNoteIcon,
  Group as GroupIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import API from '../../BackendAPi/ApiProvider';

const CustomEmail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    imageUrl: '',
    content: '',
    senderName: 'Harmony 4 All',
    // New customizable fields
    headerLogoUrl: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621503/unnamed_h8w8vg.png',
    joinMissionButtonText: 'Join Our Mission',
    joinMissionButtonLink: 'https://www.harmony4all.org/',
    followUsText: 'Follow Us',
    socialHandle: '@JoinHarmony4All',
    socialHandleLink: 'https://www.facebook.com/JoinHarmony4All/?_rdc=1&_rdr#',
    candidSealImageUrl: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621541/unnamed_xntmk0.png',
    footerEmail: 'media@harmony44all.org',
    footerLocation: 'New York, NY, USA',
    siteLinkText: 'Check out our site',
    siteLinkUrl: 'https://www.harmony4all.org/',
    // Social Media Links
    socialMediaLinks: {
      email: 'mailto:media@harmony44all.org',
      facebook: 'https://www.facebook.com/JoinHarmony4All/?_rdc=1&_rdr#',
      instagram: 'https://www.instagram.com/joinharmony4all/',
      linkedin: 'https://www.linkedin.com/company/joinharmony4all/?viewAsMember=true',
      youtube: 'https://www.youtube.com/watch?v=CQXnJpY_zR8&feature=youtu.be'
    },
    // Social Media Images
    socialMediaImages: {
      email: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621602/unnamed_idxkld.png',
      facebook: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621694/facebook-black-white-icon-facebook-face-book-png-facebook-icon-for-footer-11562873944v8l8yjbnby_pabutv.png',
      instagram: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621773/black-white-instagram-logo-icon-high-resolution-black-white-instagram-logo-white-background-vector-eps-file-available-175771733_ltrzex.webp',
      linkedin: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763621854/1384014_zokxv4.png',
      youtube: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763622158/youtube_ywf8ci.jpg'
    },
    // Funders and Sponsors Data
    fundersData: {
      bannerText: 'With Gratitude To Our Funders And Sponsors For Helping Us Keep Making Music Accessible',
      logo1: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620187/New-York-Injury-Firm_sspupt.avif',
      logo2: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620195/senate-joseph_ej5wf3.avif',
      logo3: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620200/newyorkstate_m9e31g.avif',
      logo4: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620203/nyslegis_slccsb.avif',
      logo5: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620209/councilonthearts_ktxqky.avif',
      logo6: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620215/sponsor6_qoaqwe.avif',
      logo7: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620222/NYFA_tppwjy.avif',
      logo8: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620227/sponsor8_urktzc.avif',
      logo9: 'https://res.cloudinary.com/dcrieatns/image/upload/v1763620232/sponsor9_jdsr7j.avif',
      link1: 'https://thenewyorkinjurylawfirm.com/',
      link2: 'https://www.nysenate.gov/senators/joseph-p-addabbo-jr',
      link3: 'https://www.governor.ny.gov/',
      link4: 'https://www.nysenate.gov/issues/new-york-state-legislature',
      link5: 'https://arts.ny.gov/our-mission',
      link6: 'https://www.nyc.gov/site/dcla/index.page',
      link7: 'https://www.nyfa.org/',
      link8: 'https://www.citizensnyc.org',
      link9: 'https://www.villarussocatering.com/'
    }
  });

  // Attachments state
  const [attachments, setAttachments] = useState([]);

  const [sendData, setSendData] = useState({
    senderAccountIndex: 0,
    recipientEmails: '',
    ccEmails: '',
    bccEmails: ''
  });
  
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendResults, setSendResults] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  
  // Email suggestions state
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const suggestionRef = useRef(null);

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'align', 'link'
  ];

  useEffect(() => {
    fetchGmailAccounts();
    fetchEmailSuggestions();
  }, []);

  // Fetch email suggestions when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentSearchTerm.length >= 2) {
        fetchEmailSuggestions();
        setShowSuggestions(true);
      } else if (currentSearchTerm.length === 0) {
        fetchEmailSuggestions(); // Show all suggestions initially
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [currentSearchTerm]);

  const fetchGmailAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await API.get('/api/admin/email/accounts');
      console.log('respone',response)
      setGmailAccounts(response.data);
    } catch (err) {
      setError('Failed to load Gmail accounts');
      console.error('Error fetching Gmail accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchEmailSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const params = new URLSearchParams();
      if (currentSearchTerm) params.append('search', currentSearchTerm);
      params.append('limit', '20');
      
      const response = await API.get(`/api/admin/email/suggestions?${params}`);
      setEmailSuggestions(response.data);
    } catch (err) {
      console.error('Error fetching email suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'government':
        return <SchoolIcon />;
      case 'nonprofit':
        return <BusinessIcon />;
      case 'harmony_team':
        return <GroupIcon />;
      case 'music_industry':
        return <MusicNoteIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'government':
        return '#1976d2';
      case 'nonprofit':
        return '#388e3c';
      case 'harmony_team':
        return '#f57c00';
      case 'music_industry':
        return '#7b1fa2';
      default:
        return '#757575';
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const email = suggestion.email;
    const currentEmails = selectedRecipients.map(r => r.email);
    
    if (!currentEmails.includes(email)) {
      const newRecipients = [...selectedRecipients, suggestion];
      setSelectedRecipients(newRecipients);
      
      // Update the recipient emails text field with comma
      const currentValue = sendData.recipientEmails;
      const lastCommaIndex = currentValue.lastIndexOf(',');
      const beforeLastComma = lastCommaIndex === -1 ? '' : currentValue.substring(0, lastCommaIndex + 1);
      const newValue = beforeLastComma + email + ', ';
      
      setSendData(prev => ({ ...prev, recipientEmails: newValue }));
      setCurrentSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveRecipient = (emailToRemove) => {
    const newRecipients = selectedRecipients.filter(r => r.email !== emailToRemove);
    setSelectedRecipients(newRecipients);
    
    const allEmails = newRecipients.map(r => r.email).join(', ');
    setSendData(prev => ({ ...prev, recipientEmails: allEmails }));
  };

  const handleRecipientEmailsChange = (event) => {
    const value = event.target.value;
    setSendData(prev => ({
      ...prev,
      recipientEmails: value
    }));
    
    // Extract the last part after the last comma for search
    const lastCommaIndex = value.lastIndexOf(',');
    const searchTerm = lastCommaIndex === -1 ? value.trim() : value.substring(lastCommaIndex + 1).trim();
    setCurrentSearchTerm(searchTerm);
    
    // Update selected recipients based on the text input
    const emails = value.split(',').map(email => email.trim()).filter(email => email.length > 0);
    const validRecipients = selectedRecipients.filter(r => emails.includes(r.email));
    setSelectedRecipients(validRecipients);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle file attachment
  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      // Check file size (max 25MB per file)
      if (file.size > 25 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 25MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data:...;base64, prefix
        setAttachments(prev => [...prev, {
          filename: file.name,
          content: base64Content,
          contentType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    event.target.value = '';
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const parseEmailList = (value = '') => {
    if (!value.trim()) return [];
    return value
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const parseRecipientEmails = () => parseEmailList(sendData.recipientEmails);

  const handleSend = () => {
    if (!formData.title && !formData.subject) {
      setError('Please enter either a title or subject');
      return;
    }
    setSendDialogOpen(true);
  };

  const handleSendEmail = async () => {
    const emails = parseRecipientEmails();
    const ccEmails = parseEmailList(sendData.ccEmails);
    const bccEmails = parseEmailList(sendData.bccEmails);
    if (emails.length === 0) {
      setError('Please enter at least one recipient email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }

    const invalidCcEmails = ccEmails.filter(email => !emailRegex.test(email));
    if (invalidCcEmails.length > 0) {
      setError(`Invalid CC email format: ${invalidCcEmails.join(', ')}`);
      return;
    }

    const invalidBccEmails = bccEmails.filter(email => !emailRegex.test(email));
    if (invalidBccEmails.length > 0) {
      setError(`Invalid BCC email format: ${invalidBccEmails.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await API.post('/api/admin/email/send-custom', {
        senderAccountIndex: sendData.senderAccountIndex,
        recipientEmails: emails,
        ccEmails,
        bccEmails,
        title: formData.title,
        subject: formData.subject,
        imageUrl: formData.imageUrl,
        content: formData.content,
        senderName: formData.senderName,
        headerLogoUrl: formData.headerLogoUrl,
        joinMissionButtonText: formData.joinMissionButtonText,
        joinMissionButtonLink: formData.joinMissionButtonLink,
        followUsText: formData.followUsText,
        socialHandle: formData.socialHandle,
        socialHandleLink: formData.socialHandleLink,
        candidSealImageUrl: formData.candidSealImageUrl,
        footerEmail: formData.footerEmail,
        footerLocation: formData.footerLocation,
        siteLinkText: formData.siteLinkText,
        siteLinkUrl: formData.siteLinkUrl,
        socialMediaLinks: formData.socialMediaLinks,
        socialMediaImages: formData.socialMediaImages,
        fundersData: formData.fundersData,
        attachments: attachments
      });

      setSendResults(response.data.results);
      setResultsOpen(true);
      setSendDialogOpen(false);
      setSuccess(`Email sent successfully! ${response.data.results.successful} successful, ${response.data.results.failed} failed.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
      console.error('Error sending email:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHTML = () => {
    const { 
      title, 
      imageUrl, 
      content, 
      senderName,
      headerLogoUrl,
      joinMissionButtonText,
      joinMissionButtonLink,
      followUsText,
      socialHandle,
      socialHandleLink,
      candidSealImageUrl,
      socialMediaLinks,
      socialMediaImages,
      fundersData
    } = formData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Custom Email'}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
    }
    a{
      color:rgb(0, 0, 0) !important;
    }
    a:link, a:visited, a:hover, a:active {
      color:rgb(0, 0, 0) !important;
    }
    .container { 
      max-width: 800px; 
      background-color: #ffffff;
      margin: 20px auto; 
      border: 1px solid #9ba5a5;
      background: white; 
      border-radius: 8px;
      overflow: hidden; 
    }
    .header { 
      background: white; 
      padding: isMobile ? 0px : 30px; 
      text-align: center; 
      border-bottom: 1px solid #9ba5a5; 
      width: 100%;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .logo-image {
      width: 250px;
      height: 180px;
      margin: auto;
      display: block;
      object-fit: contain;
    }
    .content { 
      padding: 30px; 
      background: white; 
    }
    .blog-title { 
      color: #2d3748; 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 15px; 
      line-height: 1.3; 
    }
    .blog-author { 
      color: #666; 
      font-size: 16px; 
      text-align: right; 
      margin-bottom: 25px; 
    }
    .blog-content { 
      margin: 0; 
      padding: 0; 
      line-height: 1.6; 
      font-size: 16px; 
    }
    .blog-content * { 
      margin-top: 0 !important; 
      margin-bottom: 0 !important; 
    }
    .blog-content p { 
      margin: 0 !important; 
      padding: 0 !important; 
      line-height: 1.6; 
    }
    .blog-content p:empty { 
      display: none; 
      height: 0; 
    }
    .blog-content ul, 
    .blog-content ol { 
      margin: 0 !important; 
      padding-left: 1.5em; 
      padding-top: 0 !important; 
      padding-bottom: 0 !important; 
    }
    .blog-content li { 
      margin: 0 !important; 
      padding: 0; 
    }
    .blog-content h1, 
    .blog-content h2, 
    .blog-content h3 { 
      margin: 0 !important; 
      padding: 0 !important; 
      line-height: 1.3; 
    }
    .footer { 
      background: #ffffff; 
      padding: 30px; 
      text-align: center; 
    }
    .join-mission-btn { 
      display: inline-block; 
      background: #000; 
      color: #fff !important; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 25px; 
      font-weight: bold; 
      margin-bottom: 25px; 
      font-size: 14px;
      font-family: Arial, sans-serif;
    }
    .join-mission-btn:hover {
      color: #fff !important;
    }
    .join-mission-btn:visited {
      color: #fff !important;
    }
    .join-mission-btn:link {
      color: #fff !important;
    }
    .follow-us { 
      margin-bottom: 20px; 
    }
    .follow-us-text { 
      font-size: 16px; 
      color: #000; 
      margin-bottom: 8px; 
      font-weight: bold;
      font-family: Arial, sans-serif;
    }
    .social-handle {
      font-size: 16px;
      color:rgb(0, 0, 0);
      margin-bottom: 15px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }
    .social-icons-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      margin-bottom: 25px;
      width: 100%;
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      flex-wrap: nowrap;
      max-width: 270px;
    }
    .social-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      margin-right: 10px;
      background:rgb(255, 255, 255);
      align-items: center;
      justify-content: center;
    }
    .social-icon img {
      width: 40px;
      height: 40px;
      object-fit: cover;
    }
    .candid-seal {
      margin-bottom: 25px;
    }
    .candid-image {
      width: 140px;
      height: auto;
      border: 2px solid #b8d4da;
      border-radius: 5px;
    }
    .contact-section { 
      display: flex; 
      justify-content: start; 
      align-items: center; 
      margin-top: 25px;
      padding-top: 20px; 
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      width: 100%;
    }
    .contact-info { 
      text-align: left; 
      font-size: 14px; 
      color: #000 !important; 
      font-family: Arial, sans-serif;
    }
    .site-link { 
      text-align: right; 
      font-size: 14px; 
      color: #000 !important; 
      font-family: Arial, sans-serif;
    }
    .arrow-image {
      width: 17px;
      height: 17px;
      margin-left: 5px;
      margin-top: 10px;
    }
    .site-link-text {
      text-decoration: none;
      color: #000 !important;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }
    .vertical-line { 
      width: 1px; 
      height: 40px; 
      background: #9ba5a5; 
      margin: 0 70px;
    }
    .blog-image-box {
      width: 100%;
      height: auto;
      margin-bottom: 20px;
    }
    .blog-image {
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
      display: block;
    }
    .funders-section {
      background: #ffffff;
    }
    .funders-banner {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .funders-title {
      color: #2d3748;
      font-size: 18px;
      font-weight: bold;
      margin: 0;
      line-height: 1.4;
    }
    .funders-logos {
      width: 100%;
    }
    .funders-row {
      width: 100%;
      margin-bottom: 15px;
    }
    .funders-logo {
      width: 33.33%;
      text-align: center;
      padding: 5px;
      vertical-align: middle;
    }
    .funders-logo-img {
      max-width: 100%;
      max-height: 80px;
      object-fit: contain;
      filter: grayscale(0%);
      transition: filter 0.3s ease;
    }
    .funders-logo-img:hover {
      filter: grayscale(0%);
    }
    .funders-logo-link {
      display: block;
      text-decoration: none;
      color: inherit;
    }
    .funders-logo-link:hover {
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <img src="${headerLogoUrl || ''}" alt="Harmony 4 All Logo" class="logo-image">            
      </div>
    </div>
    
    <div class="content">
      <h1 class="blog-title">${title || 'Harmony 4 All'}</h1>
      <div class="blog-author">By: ${senderName}</div>
      
      ${imageUrl ? `
        <div class="blog-image-box">
          <img src="${imageUrl}" alt="${title || 'Email Image'}" class="blog-image">
        </div>
      ` : ''}

      <div class="blog-content">
        ${content || '<p>Thank you for your continued support of Harmony 4 All!</p>'}
      </div>
      
    </div>
    
    <!-- Funders and Sponsors Section -->
    <div class="funders-section">
      <div class="funders-banner">
        <h3 class="funders-title">${fundersData.bannerText || 'With Gratitude To Our Funders And Sponsors For Helping Us Keep Making Music Accessible'}</h3>
      </div>
      <table class="funders-logos" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- First Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link1 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo1 || ''}" alt="Sponsor 1" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link2 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo2 || ''}" alt="Sponsor 2" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link3 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo3 || ''}" alt="Sponsor 3" class="funders-logo-img">
            </a>
          </td>
        </tr>
        <!-- Second Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link4 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo4 || ''}" alt="Sponsor 4" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link5 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo5 || ''}" alt="Sponsor 5" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link6 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo6 || ''}" alt="Sponsor 6" class="funders-logo-img">
            </a>
          </td>
        </tr>
        <!-- Third Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link7 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo7 || ''}" alt="Sponsor 7" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link8 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo8 || ''}" alt="Sponsor 8" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link9 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo9 || ''}" alt="Sponsor 9" class="funders-logo-img">
            </a>
          </td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <a href="${joinMissionButtonLink}" class="join-mission-btn">${joinMissionButtonText}</a>
      
      <div class="follow-us">
        <div class="follow-us-text">${followUsText}</div>
        <div class="social-handle">
          <a href="${socialHandleLink}" style="color: rgb(0, 0, 0); text-decoration: none;">${socialHandle}</a>
        </div>
      </div>
      
      <div class="social-icons-container">
        <a href="${socialMediaLinks.email || 'mailto:media@harmony44all.org'}" class="social-icon">
          <img src="${socialMediaImages.email || ''}" alt="Email">
        </a>
        <a href="${socialMediaLinks.facebook || '#'}" class="social-icon">
          <img src="${socialMediaImages.facebook || ''}" alt="Facebook">
        </a>
        <a href="${socialMediaLinks.instagram || '#'}" class="social-icon">
          <img src="${socialMediaImages.instagram || ''}" alt="Instagram">
        </a>
        <a href="${socialMediaLinks.linkedin || '#'}" class="social-icon">
          <img src="${socialMediaImages.linkedin || ''}" alt="LinkedIn">
        </a>
        <a href="${socialMediaLinks.youtube || '#'}" class="social-icon">
          <img src="${socialMediaImages.youtube || ''}" alt="YouTube">
        </a>
      </div>
      
      <div class="candid-seal">
      <a href="https://www.guidestar.org/profile/shared/612fc49e-8913-45bf-b8f8-cc6d46762abb" target="_blank">
        <img src="${candidSealImageUrl || ''}" alt="Platinum Transparency 2025 Candid" class="candid-image">
      </a>
      </div>
      
    </div>
  </div>
</body>
</html>`;
  };

  if (loadingAccounts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ inHeight: '100vh'}}>
      <Box display={`${isMobile && showMobilePreview ? 'none' : 'flex'}`} alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d3748' }}>
        </Typography>
        <Box display="flex" gap={2}>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={showMobilePreview ? <EditIcon /> : <PreviewIcon />}
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              sx={{ 
                borderColor: '#000', 
                color: '#000',
                borderRadius: '25px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {showMobilePreview ? 'Close Preview' : 'Preview'}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSend}
            disabled={loading}
            sx={{ 
              backgroundColor: '#000', 
              color: '#fff',
              borderRadius: '25px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333'
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

       <Grid container spacing={3} sx={{ minHeight: '100vh' }}>
        {/* Left Panel - Form Inputs */}
        <Grid item xs={12} md={6} sx={{ display: isMobile && showMobilePreview ? 'none' : 'block' }}>
          <Paper sx={{ 
            height: 'fit-content',
            borderRadius: '8px',
            boxShadow: 'none',
            border: '1px solid #9ba5a5',
            p:  isMobile ? 0 : 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 'bold' }}>
              Email Configuration
            </Typography>
            
             <Grid container spacing={2}>
               {/* Header Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Header
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Header Logo URL"
                   value={formData.headerLogoUrl}
                   onChange={handleInputChange('headerLogoUrl')}
                   placeholder="https://example.com/logo.png"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Title"
                   value={formData.title}
                   onChange={handleInputChange('title')}
                   placeholder="Email title (appears in header)"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Subject"
                   value={formData.subject}
                   onChange={handleInputChange('subject')}
                   placeholder="Email subject line"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Sender Name"
                   value={formData.senderName}
                   onChange={handleInputChange('senderName')}
                   placeholder="Harmony 4 All"
                 />
               </Grid>

               {/* Main Content Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Main Content
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Image URL"
                   value={formData.imageUrl}
                   onChange={handleInputChange('imageUrl')}
                   placeholder="https://example.com/image.jpg"
                 />
               </Grid>

               <Grid item xs={12}>
                 <Typography variant="subtitle2" gutterBottom sx={{ color: '#2d3748', fontWeight: 'bold' }}>
                   Content
                 </Typography>
                 <Box sx={{ 
                   border: '1px solid #9ba5a5', 
                   borderRadius: '4px',
                   '& .ql-editor': {
                     minHeight: '200px',
                     fontSize: '16px',
                     fontFamily: 'Arial, sans-serif'
                   },
                   '& .ql-toolbar': {
                     borderTop: 'none',
                     borderLeft: 'none',
                     borderRight: 'none',
                     borderBottom: '1px solid #9ba5a5'
                   }
                 }}>
                   <ReactQuill
                     theme="snow"
                     value={formData.content}
                     onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                     modules={quillModules}
                     formats={quillFormats}
                     placeholder="Enter your email content here..."
                   />
                 </Box>
               </Grid>

               {/* Attachments Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Attachments
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <Box>
                   <Button
                     variant="outlined"
                     component="label"
                     startIcon={<AttachFileIcon />}
                     sx={{ 
                       borderColor: '#000', 
                       color: '#000',
                       borderRadius: '25px',
                       fontWeight: 'bold',
                       mb: 2,
                       '&:hover': {
                         borderColor: '#333',
                         backgroundColor: '#f5f5f5'
                       }
                     }}
                   >
                     Add Attachment
                     <input
                       type="file"
                       hidden
                       multiple
                       onChange={handleFileAttachment}
                     />
                   </Button>
                   
                   {attachments.length > 0 && (
                     <Box sx={{ mt: 2 }}>
                       <Typography variant="subtitle2" gutterBottom sx={{ color: '#666', fontWeight: 'bold' }}>
                         Attached Files ({attachments.length}):
                       </Typography>
                       <List dense>
                         {attachments.map((attachment, index) => (
                           <ListItem
                             key={index}
                             secondaryAction={
                               <IconButton 
                                 edge="end" 
                                 aria-label="delete"
                                 onClick={() => handleRemoveAttachment(index)}
                               >
                                 <DeleteIcon />
                               </IconButton>
                             }
                             sx={{ 
                               border: '1px solid #e0e0e0', 
                               borderRadius: '4px', 
                               mb: 1,
                               backgroundColor: '#f9f9f9'
                             }}
                           >
                             <ListItemIcon>
                               <AttachFileIcon />
                             </ListItemIcon>
                             <ListItemText 
                               primary={attachment.filename}
                               secondary={`${(attachment.content.length * 0.75 / 1024 / 1024).toFixed(2)} MB`}
                             />
                           </ListItem>
                         ))}
                       </List>
                     </Box>
                   )}
                 </Box>
               </Grid>

             </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} md={6} sx={{ 
          width: isMobile ? '100%' : '40%',
          alignSelf: 'flex-start',
          height: isMobile ? '100vh' : '300vh',
          minHeight: '100vh',
          display: isMobile && !showMobilePreview ? 'none' : 'block'
        }}>
          <Paper sx={{ 
            height: '100%',
            boxShadow: 'none',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {isMobile && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#fff', 
                borderBottom: '1px solid #9ba5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" sx={{ color: '#2d3748', fontWeight: 'bold' }}>
                  Email Preview
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowMobilePreview(false)}
                  size="small"
                  sx={{ 
                    borderColor: '#000', 
                    color: '#000',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: '#333',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Close Preview
                </Button>
              </Box>
            )}
            <Box
              sx={{
                flex: 1,
                overflow: 'hidden',
                '& iframe': {
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }
              }}
            >
              <iframe
                srcDoc={generatePreviewHTML()}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

       {/* Send Dialog */}
       <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="md" fullWidth>
         <DialogTitle>Send Email</DialogTitle>
         <DialogContent>
           <Grid container spacing={3} sx={{ mt: 1 }}>
             <Grid item xs={12}>
               <FormControl fullWidth>
                 <InputLabel>Sender Account</InputLabel>
                 <Select
                   value={sendData.senderAccountIndex}
                   label="Sender Account"
                   onChange={(e) => setSendData(prev => ({ ...prev, senderAccountIndex: e.target.value }))}
                 >
                   {gmailAccounts.map((account, index) => (
                     <MenuItem key={index} value={account.index}>
                       {account.name} ({account.email})
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>

             {/* Recipient Input with Suggestions */}
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Recipient Emails"
                 multiline
                 rows={3}
                 value={sendData.recipientEmails}
                 onChange={handleRecipientEmailsChange}
                 placeholder="Type to search contacts... (e.g., email1@example.com, email2@example.com)"
                 helperText={`${parseRecipientEmails().length} emails entered`}
                 InputProps={{
                   endAdornment: loadingSuggestions ? <CircularProgress size={20} /> : null
                 }}
               />
             </Grid>

             {/* CC Input */}
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="CC Emails (optional)"
                 multiline
                 rows={2}
                 value={sendData.ccEmails}
                 onChange={(event) => setSendData(prev => ({ ...prev, ccEmails: event.target.value }))}
                 placeholder="cc1@example.com, cc2@example.com"
                 helperText={`${parseEmailList(sendData.ccEmails).length} CC emails entered`}
               />
             </Grid>

             {/* BCC Input */}
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="BCC Emails (optional)"
                 multiline
                 rows={2}
                 value={sendData.bccEmails}
                 onChange={(event) => setSendData(prev => ({ ...prev, bccEmails: event.target.value }))}
                 placeholder="bcc1@example.com, bcc2@example.com"
                 helperText={`${parseEmailList(sendData.bccEmails).length} BCC emails entered`}
               />
             </Grid>

             <Grid item xs={12}>
               {/* Email Suggestions as Chips */}
               {showSuggestions && emailSuggestions.length > 0 && (
                 <Box sx={{ mt: 2 }}>
                   <Typography variant="subtitle2" gutterBottom sx={{ color: '#666', fontWeight: 'bold' }}>
                     Suggestions:
                   </Typography>
                   <Box display="flex" flexWrap="wrap" gap={1} sx={{ maxHeight: '200px', overflow: 'auto' }}>
                     {emailSuggestions
                       .filter(suggestion => !selectedRecipients.some(r => r.email === suggestion.email))
                       .map((suggestion) => (
                         <Chip
                           key={suggestion.id}
                           label={`${suggestion.name} (${suggestion.email})`}
                           onClick={() => handleSuggestionClick(suggestion)}
                           icon={
                             <Avatar sx={{ 
                               bgcolor: getCategoryColor(suggestion.category),
                               width: 20,
                               height: 20
                             }}>
                               {getCategoryIcon(suggestion.category)}
                             </Avatar>
                           }
                           sx={{
                             cursor: 'pointer',
                             '&:hover': {
                               backgroundColor: getCategoryColor(suggestion.category),
                               color: 'white',
                               '& .MuiChip-icon': {
                                 color: 'white'
                               }
                             }
                           }}
                           size="small"
                         />
                       ))}
                   </Box>
                 </Box>
               )}

               {/* Selected Recipients */}
               {selectedRecipients.length > 0 && (
                 <Box sx={{ mt: 2 }}>
                   <Typography variant="subtitle2" gutterBottom sx={{ color: '#666', fontWeight: 'bold' }}>
                     Selected Recipients ({selectedRecipients.length}):
                   </Typography>
                   <Box display="flex" flexWrap="wrap" gap={1}>
                     {selectedRecipients.map((recipient) => (
                       <Chip
                         key={recipient.email}
                         label={`${recipient.name} (${recipient.email})`}
                         onDelete={() => handleRemoveRecipient(recipient.email)}
                         color="primary"
                         variant="outlined"
                         size="small"
                         icon={
                           <Avatar sx={{ 
                             bgcolor: getCategoryColor(recipient.category),
                             width: 20,
                             height: 20
                           }}>
                             {getCategoryIcon(recipient.category)}
                           </Avatar>
                         }
                       />
                     ))}
                   </Box>
                 </Box>
               )}
             </Grid>
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
           <Button 
             onClick={handleSendEmail} 
             variant="contained" 
             disabled={loading}
             startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
             sx={{ 
               backgroundColor: '#000', 
               color: '#fff',
               '&:hover': {
                 backgroundColor: '#333'
               }
             }}
           >
             {loading ? 'Sending...' : 'Send Email'}
           </Button>
         </DialogActions>
       </Dialog>

       {/* Send Results Dialog */}
       <Dialog open={resultsOpen} onClose={() => setResultsOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Email Send Results</DialogTitle>
         <DialogContent>
           {sendResults && (
             <Box>
               <Box display="flex" alignItems="center" gap={2} mb={2}>
                 <Chip
                   icon={<CheckCircleIcon />}
                   label={`${sendResults.successful} Successful`}
                   color="success"
                 />
                 <Chip
                   icon={<ErrorIcon />}
                   label={`${sendResults.failed} Failed`}
                   color="error"
                 />
               </Box>
               
               {sendResults.successfulEmails && sendResults.successfulEmails.length > 0 && (
                 <Box mb={2}>
                   <Typography variant="subtitle2" gutterBottom>
                     Successful Emails:
                   </Typography>
                   <List dense>
                     {sendResults.successfulEmails.map((email, index) => (
                       <ListItem key={index}>
                         <ListItemIcon>
                           <CheckCircleIcon color="success" />
                         </ListItemIcon>
                         <ListItemText primary={email} />
                       </ListItem>
                     ))}
                   </List>
                 </Box>
               )}
               
               {sendResults.failedEmails && sendResults.failedEmails.length > 0 && (
                 <Box>
                   <Typography variant="subtitle2" gutterBottom>
                     Failed Emails:
                   </Typography>
                   <List dense>
                     {sendResults.failedEmails.map((email, index) => (
                       <ListItem key={index}>
                         <ListItemIcon>
                           <ErrorIcon color="error" />
                         </ListItemIcon>
                         <ListItemText primary={email} />
                       </ListItem>
                     ))}
                   </List>
                 </Box>
               )}
             </Box>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setResultsOpen(false)}>Close</Button>
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default CustomEmail;
