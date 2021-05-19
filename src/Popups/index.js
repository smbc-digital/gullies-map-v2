import { getTargetUrl } from '../Helpers'

const gulliesActivePopup = feature => 
  `<div>
    <p class="smbc-body govuk-!-font-size-14 govuk-!-margin-0 smbc-!-font-color-white"><span class="fa fa-map-marker smbc-map__item__header__block__icon" aria-hidden="true"></span>Location</p>
    <p class="smbc-body smbc-!-font-color-white govuk-!-margin-top-0 govuk-!-margin-left-4">${feature.properties.street}</p>
    <hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">
    <input id="siteCode" name="siteCode" type="hidden" value="${feature.properties.site_code}">
    <input id="assetId" name="assetId" type="hidden" value="${feature.properties.central_asset_id}">
    <input id="easting" name="easting" type="hidden" value="${feature.properties.easting}">
    <input id="northing" name="northing" type="hidden" value="${feature.properties.northing}">
    <button class="govuk-button govuk-!-margin-bottom-0 smbc-!-width-100" data-module="govuk-button">
      Report this drain
    </button>
  </div>`

  const gulliesFaultPopup = feature => 
  `<div>
    <p class="smbc-body govuk-!-font-size-14 govuk-!-margin-0 smbc-!-font-color-white"><span class="fa fa-map-marker smbc-map__item__header__block__icon" aria-hidden="true"></span>Location</p>
    <p class="smbc-body smbc-!-font-color-white govuk-!-margin-top-0 govuk-!-margin-left-4">${feature.properties.street}</p>
    <div class="govuk-panel smbc-panel--error govuk-!-padding-1">
      <div class="smbc-panel__body smbc-!-font-color-white">
          A blocked drain has already been reported
      </div>
    </div>
    <hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">
    <a class="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 smbc-!-font-color-black smbc-!-width-100" href="${getTargetUrl()}/track-a-report/details/${feature.properties.ext_system_ref}">View this report</a>
    <a class="govuk-button govuk-!-margin-bottom-0 govuk-!-margin-top-4 smbc-!-width-100" href="https://www.stockport.gov.uk/">Go to the homepage</a>
  </div>`

const gulliesPopup = (feature, layer) => {
  var content = getcontent_gullies(feature)

  layer.bindPopup(content)
}

const getcontent_gullies = feature => {
  switch  (feature.properties.raise_new_job) {  
    case 1:
        return gulliesActivePopup(feature)
    //case 2:
        //return gulliesMaintenancePopup(feature)
    case 3:
        return gulliesFaultPopup(feature)    
  }
}

export {
  gulliesPopup
}