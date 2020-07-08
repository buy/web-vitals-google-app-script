// Updated by Chang Liu
// API doc: https://developers.google.com/speed/docs/insights/v5/get-started 
// Created by Rick Viscomi (@rick_viscomi) https://dev.to/chromiumdev/a-step-by-step-guide-to-monitoring-the-competition-with-the-chrome-ux-report-4k1o
// Adapted from https://ithoughthecamewithyou.com/post/automate-google-pagespeed-insights-with-apps-script by Robert Ellison

// PSI_API_KEY is store under File -> Project Properties -> Script Properties
var scriptProperties = PropertiesService.getScriptProperties();
var pageSpeedApiKey = scriptProperties.getProperty('PSI_API_KEY');

// [Origin, PageType, URL]
var pageSpeedMonitorUrls = [
  ['Google', 'Home', 'https://www.google.com'],
  ['Bing', 'Home', 'https://www.bing.com']
];

function monitor() {
  for (var i = 0; i < pageSpeedMonitorUrls.length; i++) {
    var origin = pageSpeedMonitorUrls[i][0];
    var pageType = pageSpeedMonitorUrls[i][1];
    var url = pageSpeedMonitorUrls[i][2];
    var desktop = callPageSpeed(url, 'desktop');
    var mobile = callPageSpeed(url, 'mobile');
    
    writeData(origin, pageType, url, desktop, mobile);
  }
}

function callPageSpeed(url, strategy) {
  var pageSpeedUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + url + '&fields=loadingExperience,lighthouseResult&key=' + pageSpeedApiKey + '&strategy=' + strategy;
  var response = UrlFetchApp.fetch(pageSpeedUrl);
  var json = response.getContentText();
  return JSON.parse(json);
}

function writeData(origin, pageType, url, desktop, mobile) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var todayDate = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');

  var sheet = spreadsheet.getSheetByName('Overall Perf');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.lighthouseResult.categories.performance.score,
    mobile.lighthouseResult.categories.performance.score
  ]);

  var sheet = spreadsheet.getSheetByName('FCP');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
    mobile.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
  ]);

  var sheet = spreadsheet.getSheetByName('FID');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile,
    mobile.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile,
  ]);
  
  var sheet = spreadsheet.getSheetByName('LCP');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
    mobile.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
  ]);
  
  var sheet = spreadsheet.getSheetByName('CLS');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile,
    mobile.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile,
  ]);
  
  var sheet = spreadsheet.getSheetByName('Total Blocking Time');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.lighthouseResult.audits['total-blocking-time'].numericValue,
    mobile.lighthouseResult.audits['total-blocking-time'].numericValue,
  ]);
    
  var sheet = spreadsheet.getSheetByName('SpeedIndex');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.lighthouseResult.audits['speed-index'].numericValue,
    mobile.lighthouseResult.audits['speed-index'].numericValue,
  ]);
  
  var sheet = spreadsheet.getSheetByName('Interactive');
  sheet.appendRow([
    todayDate,
    origin,
    pageType,
    url,
    desktop.lighthouseResult.audits.interactive.numericValue,
    mobile.lighthouseResult.audits.interactive.numericValue,
  ]);
}
