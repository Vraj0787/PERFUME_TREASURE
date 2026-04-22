from flask import Blueprint, request
from flask_jwt_extended import jwt_required
import requests
import re

from ..extensions import db
from ..models.address import Address
from ..serializers import serialize_address
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

addresses_bp = Blueprint("addresses", __name__)

# List of valid country names (case-insensitive)
VALID_COUNTRIES = {
    "afghanistan", "albania", "algeria", "andorra", "angola", "antigua and barbuda", "argentina", "armenia", "australia", "austria",
    "azerbaijan", "bahamas", "bahrain", "bangladesh", "barbados", "belarus", "belgium", "belize", "benin", "bhutan",
    "bolivia", "bosnia and herzegovina", "botswana", "brazil", "brunei", "bulgaria", "burkina faso", "burundi", "cabo verde", "cambodia",
    "cameroon", "canada", "central african republic", "chad", "chile", "china", "colombia", "comoros", "congo", "costa rica",
    "croatia", "cuba", "cyprus", "czechia", "denmark", "djibouti", "dominica", "dominican republic", "ecuador", "egypt",
    "el salvador", "equatorial guinea", "eritrea", "estonia", "eswatini", "ethiopia", "fiji", "finland", "france", "gabon",
    "gambia", "georgia", "germany", "ghana", "greece", "grenada", "guatemala", "guinea", "guinea-bissau", "guyana",
    "haiti", "honduras", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel",
    "italy", "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kiribati", "kuwait", "kyrgyzstan", "laos",
    "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein", "lithuania", "luxembourg", "madagascar", "malawi",
    "malaysia", "maldives", "mali", "malta", "marshall islands", "mauritania", "mauritius", "mexico", "micronesia", "moldova",
    "monaco", "mongolia", "montenegro", "morocco", "mozambique", "myanmar", "namibia", "nauru", "nepal", "netherlands",
    "new zealand", "nicaragua", "niger", "nigeria", "north korea", "north macedonia", "norway", "oman", "pakistan", "palau",
    "panama", "papua new guinea", "paraguay", "peru", "philippines", "poland", "portugal", "qatar", "romania", "russia",
    "rwanda", "saint kitts and nevis", "saint lucia", "saint vincent and the grenadines", "samoa", "san marino", "sao tome and principe", "saudi arabia", "senegal", "serbia",
    "seychelles", "sierra leone", "singapore", "slovakia", "slovenia", "solomon islands", "somalia", "south africa", "south korea", "south sudan",
    "spain", "sri lanka", "sudan", "suriname", "sweden", "switzerland", "syria", "taiwan", "tajikistan", "tanzania",
    "thailand", "timor-leste", "togo", "tonga", "trinidad and tobago", "tunisia", "turkey", "turkmenistan", "tuvalu", "uganda",
    "ukraine", "united arab emirates", "united kingdom", "united states", "uruguay", "uzbekistan", "vanuatu", "vatican city", "venezuela", "vietnam",
    "yemen", "zambia", "zimbabwe"
}


def _set_default_address(user_id, address):
    Address.query.filter_by(user_id=user_id, is_default=True).update({"is_default": False})
    address.is_default = True


def _validate_address(address):
    issues = []
    
    # Validate phone number format if provided
    if address.phone:
        # Basic international phone number regex (allows +country code followed by digits, spaces, dashes, parentheses)
        phone_pattern = re.compile(r'^\+?[\d\s\-\(\)]{7,20}$')
        if not phone_pattern.match(address.phone):
                issues.append("Phone number format is invalid. Please use international format like +1 123 456 7890.")
    
    # Validate country name
    if address.country.lower() not in VALID_COUNTRIES:
        issues.append(f"Country '{address.country}' is not a recognized country name. Please check the spelling.")
    
    # Construct full address string
    full_address = f"{address.line1}"
    if address.line2:
        full_address += f", {address.line2}"
    full_address += f", {address.city}"
    if address.state:
        full_address += f", {address.state}"
    full_address += f", {address.postal_code}, {address.country}"

    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "format": "json",
                "q": full_address,
                "limit": 1,
                "addressdetails": 1
            },
            headers={"User-Agent": "PerfumeTreasure/1.0"}
        )
        response.raise_for_status()
        data = response.json()
        
        if not data:
                issues.append("The address could not be found on the map. Please verify the street address, city, and postal code.")
        else:
            # Get the parsed address from the result
            result = data[0]
            parsed = result.get("address", {})
            
            # Check key components
            # Check country
            geocoded_country = parsed.get("country", "").lower()
            entered_country = address.country.lower()
            if geocoded_country and entered_country not in geocoded_country and geocoded_country not in entered_country:
                    issues.append(f"The country '{address.country}' does not match the location found. The geocoded country is '{parsed.get('country', 'unknown')}'.")
            
            # Check city
            geocoded_city = parsed.get("city", parsed.get("town", parsed.get("village", ""))).lower()
            entered_city = address.city.lower()
            if geocoded_city and entered_city not in geocoded_city and geocoded_city not in entered_city:
                    issues.append(f"The city '{address.city}' was not found in the location. The geocoded city is '{geocoded_city.title()}'.")
        
            # Check postal code
            geocoded_postal = parsed.get("postcode", "")
            entered_postal = address.postal_code
            if geocoded_postal and geocoded_postal != entered_postal:
                issues.append(f"The postal code '{address.postal_code}' does not match the location. The geocoded postal code is '{geocoded_postal}'.")
        
            # Check state/province
            if address.state:
                geocoded_state = parsed.get("state", parsed.get("province", "")).lower()
                entered_state = address.state.lower()
                if geocoded_state and entered_state not in geocoded_state and geocoded_state not in entered_state:
                    issues.append(f"The state/province '{address.state}' does not match the location. The geocoded state is '{geocoded_state.title()}'.")
        
        if issues:
            return {"valid": False, "message": "Address validation issues: " + "; ".join(issues)}
        
        return {"valid": True}
    
    except requests.RequestException:
        # If geocoding fails, we'll allow the address for now
        return {"valid": True}


@addresses_bp.get("")
@jwt_required()
def list_addresses():
    user = get_current_user()
    addresses = Address.query.filter_by(user_id=user.id).order_by(Address.created_at.desc()).all()
    return success_response([serialize_address(address) for address in addresses])


@addresses_bp.post("")
@jwt_required()
def create_address():
    user = get_current_user()
    payload = request.get_json() or {}

    required_fields = ["full_name", "line1", "city", "postal_code", "country"]
    missing = [field for field in required_fields if not (payload.get(field) or "").strip()]

    if missing:
        return error_response("Missing required address fields", errors=missing)

    address = Address(
        user_id=user.id,
        full_name=payload["full_name"].strip(),
        line1=payload["line1"].strip(),
        line2=(payload.get("line2") or "").strip() or None,
        city=payload["city"].strip(),
        state=(payload.get("state") or "").strip() or None,
        postal_code=payload["postal_code"].strip(),
        country=payload["country"].strip(),
        phone=(payload.get("phone") or "").strip() or None,
        is_default=bool(payload.get("is_default", False)),
    )

    # Validate the address
    validation = _validate_address(address)
    if not validation["valid"]:
        return error_response(validation["message"])

    if address.is_default or not user.addresses:
        _set_default_address(user.id, address)

    db.session.add(address)
    db.session.commit()
    return success_response(serialize_address(address), "Address created", 201)


@addresses_bp.patch("/<address_id>")
@jwt_required()
def update_address(address_id):
    user = get_current_user()
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()

    if not address:
        return error_response("Address not found", 404)

    payload = request.get_json() or {}

    for field in ["full_name", "line1", "line2", "city", "state", "postal_code", "country", "phone"]:
        if field in payload:
            value = payload.get(field)
            setattr(address, field, value.strip() if isinstance(value, str) else value)

    # Validate the address if any address fields were updated
    address_fields = {"line1", "line2", "city", "state", "postal_code", "country"}
    if any(field in payload for field in address_fields):
        validation = _validate_address(address)
        if not validation["valid"]:
            return error_response(validation["message"])

    if payload.get("is_default") is True:
        _set_default_address(user.id, address)

    db.session.commit()
    return success_response(serialize_address(address), "Address updated")


@addresses_bp.delete("/<address_id>")
@jwt_required()
def delete_address(address_id):
    user = get_current_user()
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if not address:
        return error_response("Address not found", 404)

    db.session.delete(address)
    db.session.commit()
    return success_response(message="Address removed")
