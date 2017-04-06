import axios from 'axios';
import {sprintf} from 'sprintf-js';

export function getCompetitorsAndStars(biz_id, num_months) {
  return axios.get(sprintf('/api/business/%s/competitor-stars/?months=%d', biz_id, num_months));
}

export function getComperitiveRadius(biz_id) {
  return axios.get(sprintf('/api/business/%s/get-competitive-radius/', biz_id));
}

export function getCompetitorsByRadius(biz_id, radius, num_months) {
  return axios.get(sprintf('/api/business/%s/get-competitors-by-radius/%s/?months=%d', biz_id, radius, num_months));
}

export function getPercentAboveAverage(biz_id) {
  return axios.get(sprintf('/api/business/%s/percent-above-average/', biz_id));
}

export function getStarDistrobution(biz_id) {
  return axios.get(sprintf('/api/business/%s/star-distrobution/', biz_id));
}

