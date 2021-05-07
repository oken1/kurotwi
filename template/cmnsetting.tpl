<div class='panel_btns'>
	<div>
		<a id='cmnsetting_apply' class='btn panel_btn'>(i18n_0255)</a>
	</div>
</div>
<div id='cmnsetting_items'>
	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0247)</div>
	<div class='kinditems'>
			<div class='group'>
			<div class='title'>
				(i18n_0389)
			</div>
			<div class='selectboxcontainer'>
				<select id='cset_locale'>
					<option value='en'>English</option>
					<option value='zh_CN'>简体中文</option>
					<option value='ja'>日本語</option>
					<option value='de'>Deutsch</option>
					<option value='fr'>français</option>
					<option value='it'>italiano</option>
					<option value='pt_BR'>português</option>
					<option value='ru'>русский</option>
					<option value='es'>español</option>
				</select>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0136)
			</div>
			<div class='slidercontainer'>
				<span class='slidestr'></span>
				<span id='cset_font_size'></span>
				<span class='slidestr'></span>
				<span id='cset_font_size_disp' class='value_disp'>{$param->font_size}px</span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0300)
			</div>
			<div class='textboxcontainer'>
				<input type='text' maxlength='64' id='cset_font_family' value='{$param->font_family}'>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_snap' {if $param->snap==1}checked{/if}></span>
				<span>(i18n_0114)</span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0340)
			</div>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_scroll_vertical' {if $param->scroll_vertical==1}checked{/if}></span>
				<span>(i18n_0341)</span>
			</div>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_scroll_horizontal' {if $param->scroll_horizontal==1}checked{/if}></span>
				<span>(i18n_0342)</span>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0368)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='title'>
				(i18n_0369)
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0373)</span>
				<span><input type='text' value='{$param->color->panel->background}'></span>
				<span><input type='color' id='cset_color_panel_background' value='{$param->color->panel->background}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0374)</span>
				<span><input type='text' value='{$param->color->panel->text}'></span>
				<span><input type='color' id='cset_color_panel_text' value='{$param->color->panel->text}'></span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0370)
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0373)</span>
				<span><input type='text' value='{$param->color->tweet->background}'></span>
				<span><input type='color' id='cset_color_tweet_background' value='{$param->color->tweet->background}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0374)</span>
				<span><input type='text' value='{$param->color->tweet->text}'></span>
				<span><input type='color' id='cset_color_tweet_text' value='{$param->color->tweet->text}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0375)</span>
				<span><input type='text' value='{$param->color->tweet->link}'></span>
				<span><input type='color' id='cset_color_tweet_link' value='{$param->color->tweet->link}'></span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0371)
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0373)</span>
				<span><input type='text' value='{$param->color->titlebar->background}'></span>
				<span><input type='color' id='cset_color_titlebar_background' value='{$param->color->titlebar->background}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0374)</span>
				<span><input type='text' value='{$param->color->titlebar->text}'></span>
				<span><input type='color' id='cset_color_titlebar_text' value='{$param->color->titlebar->text}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0376)</span>
				<span><input type='text' value='{$param->color->titlebar->fixed}'></span>
				<span><input type='color' id='cset_color_titlebar_fixed' value='{$param->color->titlebar->fixed}'></span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0372)
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0373)</span>
				<span><input type='text' value='{$param->color->button->background}'></span>
				<span><input type='color' id='cset_color_button_background' value='{$param->color->button->background}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0374)</span>
				<span><input type='text' value='{$param->color->button->text}'></span>
				<span><input type='color' id='cset_color_button_text' value='{$param->color->button->text}'></span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0380)
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0373)</span>
				<span><input type='text' value='{$param->color->scrollbar->background}'></span>
				<span><input type='color' id='cset_color_scrollbar_background' value='{$param->color->scrollbar->background}'></span>
			</div>
			<div class='colorcontainer'>
				<span>(i18n_0381)</span>
				<span><input type='text' value='{$param->color->scrollbar->thumb}'></span>
				<span><input type='color' id='cset_color_scrollbar_thumb' value='{$param->color->scrollbar->thumb}'></span>
			</div>
		</div>
		<div class='group'>
			<div class='textboxcontainer'>
				<span><a class='btn' id='cset_reset_color'>(i18n_0377)</a></span>
				<span><a class='btn' id='cset_tweet_color'>(i18n_0378)</a></span>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0093)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='title'>
				(i18n_0198)
			</div>
			<div class='slidercontainer'>
				<span><a class='btn tooltip' id='cset_audition' tooltip='(i18n_0226)'>♪</a></span>
				<span class='slidestr'></span>
				<span id='cset_notify_sound_volume'></span>
				<span class='slidestr'></span>
				<span id='cset_notify_sound_volume_disp' class='value_disp'>{$param->notify_sound_volume}</span>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_notify_new' {if $param->notify_new==1}checked{/if}></span>
				<span>(i18n_0238)</span>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_notify_incoming' {if $param->notify_incoming==1}checked{/if}></span>
				<span>(i18n_0130)</span>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0083)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='title'>
				(i18n_0086)
			</div>
			<div class='radiocontainer'>
				<div><input type='radio' name='cset_tweetkey' value='0' {if $param->tweetkey==0}checked{/if}>Ctrl+Enter</div>
				<div><input type='radio' name='cset_tweetkey' value='1' {if $param->tweetkey==1}checked{/if}>Shift+Enter</div>
				<div><input type='radio' name='cset_tweetkey' value='2' {if $param->tweetkey==2}checked{/if}>Enter</div>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0077)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='title'>
				(i18n_0240)
			</div>
			<div class='slidercontainer'>
				<span class='slidestr'></span>
				<span id='cset_reload_time'></span>
				<span class='slidestr'></span>
				<span id='cset_reload_time_disp' class='value_disp'>{$param->reload_time}(i18n_0270)</span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0191)
			</div>
			<div class='slidercontainer'>
				<span class='slidestr'></span>
				<span id='cset_get_count'></span>
				<span class='slidestr'></span>
				<span id='cset_get_count_disp' class='value_disp'>{$param->get_count}(i18n_0204)</span>
			</div>
		</div>
		<div class='group'>
			<div class='title'>
				(i18n_0078)
			</div>
			<div class='slidercontainer'>
				<span class='slidestr'></span>
				<span id='cset_max_count'></span>
				<span class='slidestr'></span>
				<span id='cset_max_count_disp' class='value_disp'>{$param->max_count}(i18n_0204)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_thumbnail' {if $param->thumbnail==1}checked{/if}></span>
				<span>(i18n_0153)</span>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_urlexpand' {if $param->urlexpand==1}checked{/if}></span>
				<span>(i18n_0154)</span>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_newscroll' {if $param->newscroll==1}checked{/if}></span>
				<span>(i18n_0239)</span>
			</div>
		</div>
		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_auto_thumb' {if $param->auto_thumb==1}checked{/if}></span>
				<span>(i18n_0070)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_follow_mark' {if $param->follow_mark==1}checked{/if}></span>
				<span>(i18n_0249)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_onlyone_rt' {if $param->onlyone_rt==1}checked{/if}></span>
				<span>(i18n_0178)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_rt_accsel' {if $param->rt_accsel==1}checked{/if}></span>
				<span>(i18n_0176)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_confirm_rt' {if $param->confirm_rt==1}checked{/if}></span>
				<span>(i18n_0352)</span>
			</div>
		</div>

		<div class='group'>
			<div class='checkboxcontainer'>
				<span><input type='checkbox' id='cset_exclude_retweets' {if $param->exclude_retweets==1}checked{/if}></span>
				<span>(i18n_0343)</span>
			</div>
		</div>

		<div class='group'>
			<div class='title'>
				(i18n_0301)
			</div>
			<div class='radiocontainer'>
				<div><input type='radio' name='cset_search_lang' value='0' {if $param->search_lang==0}checked{/if}>(i18n_0302)</div>
				<div><input type='radio' name='cset_search_lang' value='1' {if $param->search_lang==1}checked{/if}>(i18n_0303)</div>
			</div>
		</div>

		<div class='group'>
			<div class='title'>
				(i18n_0304)
			</div>
			<div class='radiocontainer'>
				<div><input type='radio' name='cset_timedisp' value='0' {if $param->timedisp==0}checked{/if}>(i18n_0305)(YYYY/MM/DD hh:mm:ss)</div>
				<div><input type='radio' name='cset_timedisp' value='1' {if $param->timedisp==1}checked{/if}>(i18n_0306)(～(i18n_0270)、～(i18n_0272)、…)</div>
			</div>
		</div>

		<div class='group'>
			<div class='title'>
				(i18n_0307)
			</div>
			<div class='radiocontainer'>
				<div><input type='radio' name='cset_namedisp' value='0' {if $param->namedisp==0}checked{/if}><span class='name_large'>@(i18n_0308)</span> <span class='name_small'>(i18n_0281)</span></div>
				<div><input type='radio' name='cset_namedisp' value='1' {if $param->namedisp==1}checked{/if}><span class='name_large'>(i18n_0281)</span> <span class='name_small'>@(i18n_0308)</span></div>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0309)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='title'>
				(i18n_0310)
			</div>
			<div class='textboxcontainer'>
				<input type='text' maxlength='140' id='cset_nowbrowsing_text' value='{$param->nowbrowsing_text}'>
			</div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0108)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='textboxcontainer'>
				<span><a class='btn' id='cset_hashappend'>(i18n_0253)</a></span>
			</div>
		</div>
		<div class='group'>
			<div id='csethash_list'>
			</div>
			<div id='hashtag_pulldown' class='pulldown'></div>
		</div>
	</div>

	<div class='kind'><span class='icon-arrow_down'></span>(i18n_0028)</div>
	<div class='kinditems'>
		<div class='group'>
			<div class='textboxcontainer'>
				<span><a class='btn' id='cset_ngappend'>(i18n_0253)</a></span>
			</div>
		</div>
		<div class='group'>
			<div id='csetng_list'>
			</div>
		</div>
	</div>
</div>
